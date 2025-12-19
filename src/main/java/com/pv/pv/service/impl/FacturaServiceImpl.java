package com.pv.pv.service.impl;

import com.pv.pv.model.Factura;
import com.pv.pv.model.Venta;
import com.pv.pv.repository.FacturaRepository;
import com.pv.pv.repository.VentaRepository;
import com.pv.pv.service.FacturaService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FacturaServiceImpl implements FacturaService {

    private final FacturaRepository repo;
    private final VentaRepository vRepo;

    public FacturaServiceImpl(FacturaRepository repo, VentaRepository vRepo) {
        this.repo = repo;
        this.vRepo = vRepo;
    }

    public List<Factura> lst() {
        return repo.findAll();
    }

    public Factura save(Factura f) {

        Venta v = vRepo.findById(f.getVentaId())
                .orElseThrow(() -> new RuntimeException("Venta no existe"));

        if (!"PAGADA".equalsIgnoreCase(v.getEstado()))
            throw new RuntimeException("Venta no pagada");

        if (repo.findByVentaId(f.getVentaId()).isPresent())
            throw new RuntimeException("Venta ya facturada");

        f.setEstado("ACTIVA");
        if (f.getTimbrado() == null) f.setTimbrado(0);

        return repo.save(f);
    }

    public void cnl(Integer id) {
        Factura f = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));

        if ("CANCELADA".equals(f.getEstado())) return;

        repo.cancelarFactura(id);
    }

    public Double tot() { return repo.totalFacturado(); }
    public Long act() { return repo.facturasActivas(); }
    public Long cnlCnt() { return repo.facturasCanceladas(); }
    public Double totCnl() { return repo.totalCancelado(); }

    public List<Factura> per(LocalDateTime ini, LocalDateTime fin) {
        return repo.facturasPorPeriodo(ini, fin);
    }
}
