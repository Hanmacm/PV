package com.pv.pv.service.impl;

import com.pv.pv.dto.CajaReporteDTO;
import com.pv.pv.model.Caja;
import com.pv.pv.model.CajaMovimiento;
import com.pv.pv.repository.CajaMovimientoRepository;
import com.pv.pv.repository.CajaRepository;
import com.pv.pv.service.CajaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CajaServiceImpl implements CajaService {

    private final CajaRepository cjRepo;
    private final CajaMovimientoRepository movRepo;

    public CajaServiceImpl(CajaRepository cjRepo, CajaMovimientoRepository movRepo) {
        this.cjRepo = cjRepo;
        this.movRepo = movRepo;
    }

    @Override
    @Transactional
    public Caja abrirCaja(Double monto, Integer usuario) {

        if (monto == null || monto < 0) {
            throw new RuntimeException("Monto inválido");
        }
        if (usuario == null || usuario <= 0) {
            throw new RuntimeException("Usuario inválido");
        }

        cjRepo.findByEstado("Abierta").ifPresent(c -> {
            throw new RuntimeException("Ya hay una caja abierta");
        });

        Caja cj = new Caja();
        cj.setUsuarioId(usuario);
        cj.setFechaInicio(LocalDateTime.now());
        cj.setMontoInicial(monto);
        cj.setEstado("Abierta");

        return cjRepo.save(cj);
    }

    @Override
    @Transactional
    public Caja cerrarCaja() {

        Caja act = cjRepo.findByEstado("Abierta")
                .orElseThrow(() -> new RuntimeException("No hay caja abierta"));

        double total = act.getMontoInicial() != null ? act.getMontoInicial() : 0.0;

        List<CajaMovimiento> lst = movRepo.findByCajaId(act.getId());
        for (CajaMovimiento m : lst) {
            String t = m.getTipo() == null ? "" : m.getTipo().trim();
            if ("Entrada".equalsIgnoreCase(t)) total += safe(m.getMonto());
            if ("Salida".equalsIgnoreCase(t)) total -= safe(m.getMonto());
        }

        act.setMontoFinal(total);
        act.setFechaCierre(LocalDateTime.now());
        act.setEstado("Cerrada");

        return cjRepo.save(act);
    }

    @Override
    @Transactional
    public CajaMovimiento registrarMovimiento(String tipo, Double monto, String detalle) {

        Caja act = cjRepo.findByEstado("Abierta")
                .orElseThrow(() -> new RuntimeException("Caja no disponible"));

        String t = tipo == null ? "" : tipo.trim();
        if (!"Entrada".equalsIgnoreCase(t) && !"Salida".equalsIgnoreCase(t)) {
            throw new RuntimeException("Tipo no válido (Entrada/Salida)");
        }

        if (monto == null || monto <= 0) {
            throw new RuntimeException("Monto incorrecto");
        }

        String txt = (detalle == null) ? "" : detalle.trim();
        if (txt.isBlank()) txt = "Movimiento sin concepto";

        CajaMovimiento mov = new CajaMovimiento();
        mov.setCaja(act);
        mov.setTipo(cap(t));
        mov.setMonto(monto);
        mov.setConcepto(txt);
        mov.setFecha(LocalDateTime.now());

        return movRepo.save(mov);
    }

    @Override
    public Caja obtenerCajaActual() {
        return cjRepo.findByEstado("Abierta").orElse(null);
    }

    @Override
    public List<Caja> historial() {
        return cjRepo.findAll();
    }

    @Override
    public List<CajaMovimiento> movimientosPorCaja(Integer idCaja) {

        if (idCaja == null || idCaja <= 0) {
            throw new RuntimeException("ID inválido");
        }

        Caja cj = cjRepo.findById(idCaja)
                .orElseThrow(() -> new RuntimeException("Caja no existe"));

        if (!"Cerrada".equalsIgnoreCase(cj.getEstado())) {
            throw new RuntimeException("Esa caja aún está abierta");
        }

        return movRepo.findByCajaId(idCaja);
    }

    @Override
    public CajaReporteDTO reporteCajas() {

        CajaReporteDTO r = new CajaReporteDTO();

        r.setTotalCajas(nz(cjRepo.totalCajas()));
        r.setCajasAbiertas(nz(cjRepo.cajasAbiertas()));
        r.setCajasCerradas(nz(cjRepo.cajasCerradas()));

        double ent = safe(movRepo.totalEntradas());
        double sal = safe(movRepo.totalSalidas());

        r.setTotalEntradas(ent);
        r.setTotalSalidas(sal);
        r.setBalance(ent - sal);

        cjRepo.ultimaCajaAbierta().stream().findFirst()
                .ifPresent(c -> r.setUltimaCajaAbiertaId(c.getId()));

        cjRepo.ultimaCajaCerrada().stream().findFirst()
                .ifPresent(c -> r.setUltimaCajaCerradaId(c.getId()));

        return r;
    }

    private long nz(Long v) { return v == null ? 0L : v; }
    private double safe(Double v) { return v == null ? 0.0 : v; }

    private String cap(String s) {
        if (s == null || s.isBlank()) return s;
        String x = s.trim().toLowerCase();
        return x.substring(0,1).toUpperCase() + x.substring(1);
    }
}
