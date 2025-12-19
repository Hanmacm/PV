package com.pv.pv.service.impl;

import com.pv.pv.dto.CotizacionRequest;
import com.pv.pv.model.*;
import com.pv.pv.repository.CotizacionRepository;
import com.pv.pv.repository.ProductoRepository;
import com.pv.pv.repository.VentaRepository;
import com.pv.pv.service.CajaService;
import com.pv.pv.service.CotizacionService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CotizacionServiceImpl implements CotizacionService {

    private final CotizacionRepository repo;
    private final VentaRepository vRepo;
    private final ProductoRepository pRepo;
    private final CajaService caja;

    @Override
    public Cotizacion guardarCotizacion(CotizacionRequest r) {
        Cotizacion c = new Cotizacion();
        mapear(c, r);
        return repo.save(c);
    }

    @Override
    public List<Cotizacion> listar() {
        List<Cotizacion> l = repo.findAll();
        l.forEach(this::vigencia);
        return l;
    }

    @Override
    public Cotizacion obtener(Integer id) {
        Cotizacion c = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe"));
        vigencia(c);
        return c;
    }

    @Override
    public Cotizacion actualizar(Integer id, CotizacionRequest r) {
        Cotizacion c = obtener(id);
        c.getDetalles().clear();
        mapear(c, r);
        return repo.save(c);
    }

    @Override
    public void eliminar(Integer id) {
        repo.deleteById(id);
    }

@Transactional
@Override
public Venta convertirAVenta(Integer id) {

    var cajaActiva = caja.obtenerCajaActual();

    if (cajaActiva == null || !"Abierta".equalsIgnoreCase(cajaActiva.getEstado())) {
        throw new RuntimeException("No hay caja abierta para convertir la cotización");
    }

    Cotizacion c = obtener(id);

    if ("CONVERTIDA".equals(c.getEstado()))
        throw new RuntimeException("La cotización ya fue convertida");

        Venta v = new Venta();
        v.setClienteId(c.getClienteId());
        v.setUsuarioId(1);
        v.setMetodoPago("cotizacion");
        v.setFecha(LocalDateTime.now());
        v.setEstado("PAGADA");
        v.setTotal(c.getTotal());

        List<VentaDetalle> dets = new ArrayList<>();

        for (CotizacionDetalle d : c.getDetalles()) {
            Producto p = pRepo.findById(d.getProductoId())
                    .orElseThrow();

            if (p.getStock() < d.getCantidad())
                throw new RuntimeException("Sin stock");

            p.setStock(p.getStock() - d.getCantidad());
            pRepo.save(p);

            VentaDetalle vd = new VentaDetalle();
            vd.setVenta(v);
            vd.setProductoId(d.getProductoId());
            vd.setCantidad(d.getCantidad());
            vd.setPrecio(d.getPrecio());
            vd.setSubtotal(d.getSubtotal());
            dets.add(vd);
        }

        v.setDetalles(dets);
        Venta g = vRepo.save(v);

        caja.registrarMovimiento(
                "Entrada",
                g.getTotal(),
                "Venta desde cot #" + g.getId()
        );

        c.setEstado("CONVERTIDA");
        repo.save(c);

        return g;
    }

    @Override
    public List<Cotizacion> cotizacionesHoy() {
        LocalDate h = LocalDate.now();
        return repo.cotizacionesPorPeriodo(
                h.atStartOfDay(),
                h.atTime(LocalTime.MAX)
        );
    }

    @Override
    public List<Cotizacion> cotizacionesPorFecha(String f) {
        LocalDate d = LocalDate.parse(f);
        return repo.cotizacionesPorPeriodo(
                d.atStartOfDay(),
                d.atTime(LocalTime.MAX)
        );
    }

    @Override
    public void cancelar(Integer id) {
        Cotizacion c = obtener(id);
        if (!"CONVERTIDA".equals(c.getEstado())) {
            c.setEstado("CANCELADA");
            repo.save(c);
        }
    }

    @Override
    public Map<String, Object> reportePeriodo(LocalDateTime i, LocalDateTime f) {
        Map<String,Object> m = new HashMap<>();
        long cant = repo.totalCotizacionesPeriodo(i,f);
        long conv = repo.totalConvertidasPeriodo(i,f);

        m.put("total", repo.totalCotizadoPeriodo(i,f));
        m.put("cantidad", cant);
        m.put("convertidas", conv);
        m.put("canceladas", repo.totalCanceladasPeriodo(i,f));
        m.put("conversion", cant == 0 ? 0 : (conv * 100.0 / cant));
        return m;
    }

    private void mapear(Cotizacion c, CotizacionRequest r){
        c.setClienteId(r.getClienteId());
        c.setNotas(r.getNotas());
        if (c.getFecha() == null) c.setFecha(LocalDateTime.now());

        if (r.getDiasVigencia() != null && r.getDiasVigencia() > 0)
            c.setVigencia(c.getFecha().toLocalDate().plusDays(r.getDiasVigencia()));

        double tot = 0;
        List<CotizacionDetalle> ds = new ArrayList<>();

        for (var d : r.getDetalles()) {
            CotizacionDetalle cd = new CotizacionDetalle();
            cd.setProductoId(d.getProductoId());
            cd.setCantidad(d.getCantidad());
            cd.setPrecio(d.getPrecio());
            cd.setSubtotal(d.getPrecio() * d.getCantidad());
            cd.setCotizacion(c);
            tot += cd.getSubtotal();
            ds.add(cd);
        }

        c.setDetalles(ds);
        c.setTotal(tot);
    }

    private void vigencia(Cotizacion c){
        if (c.getVigencia() != null &&
            LocalDate.now().isAfter(c.getVigencia()) &&
            "ACTIVA".equals(c.getEstado())) {
            c.setEstado("VENCIDA");
            repo.save(c);
        }
    }
}
