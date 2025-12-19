package com.pv.pv.service.impl;

import com.pv.pv.dto.CompraDetalleDTO;
import com.pv.pv.dto.CompraRequestDTO;
import com.pv.pv.model.Compra;
import com.pv.pv.model.CompraDetalle;
import com.pv.pv.model.Producto;
import com.pv.pv.repository.CompraDetalleRepository;
import com.pv.pv.repository.CompraRepository;
import com.pv.pv.repository.ProductoRepository;
import com.pv.pv.service.CompraService;
import com.pv.pv.dto.CompraReporteDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;

@Service
public class CompraServiceImpl implements CompraService {

    @Autowired private CompraRepository compRepo;
    @Autowired private CompraDetalleRepository detRepo;
    @Autowired private ProductoRepository prodRepo;

    @Override
    public List<Compra> listarCompras() {
        return compRepo.findAll();
    }

    @Override
    public Compra guardarCompra(CompraRequestDTO dto) {

        Compra c = new Compra();
        c.setProveedorId(dto.getProveedorId());
        c.setUsuarioId(dto.getUsuarioId());
        c.setFolio(dto.getFolio());
        c.setFecha(LocalDateTime.parse(dto.getFecha() + "T00:00:00"));
        c.setEstado("REGISTRADA");
        c.setTotal(0.0);

        c = compRepo.save(c);

        double suma = 0;

        for (CompraDetalleDTO d : dto.getDetalle()) {

            CompraDetalle cd = new CompraDetalle();
            cd.setCompra(c);
            cd.setProductoId(d.getProductoId());
            cd.setCantidad(d.getCantidad());
            cd.setCosto(d.getCosto());
            cd.setSubtotal(d.getCantidad() * d.getCosto());

            detRepo.save(cd);

            Producto p = prodRepo.findById(d.getProductoId())
                    .orElseThrow();

            p.setStock(p.getStock() + d.getCantidad());
            prodRepo.save(p);

            suma += cd.getSubtotal();
        }

        c.setTotal(suma);
        return compRepo.save(c);
    }

    @Override
    public void cancelarCompra(Integer id) {

        Compra c = compRepo.findById(id).orElseThrow();

        if ("CANCELADA".equals(c.getEstado())) return;

        for (CompraDetalle d : c.getDetalle()) {
            Producto p = prodRepo.findById(d.getProductoId()).orElseThrow();
            p.setStock(p.getStock() - d.getCantidad());
            prodRepo.save(p);
        }

        c.setEstado("CANCELADA");
        compRepo.save(c);
    }

    @Override
    public List<Compra> comprasHoy() {
        return compRepo.comprasHoy();
    }

    @Override
    public List<Compra> comprasPorFecha(LocalDate fecha) {
        return compRepo.comprasPorFecha(fecha);
    }

    @Override
    public CompraReporteDTO reporteGeneral() {
        return new CompraReporteDTO(
                compRepo.totalCompras(),
                compRepo.montoTotal(),
                compRepo.comprasCanceladas(),
                compRepo.comprasRegistradas()
        );
    }

    @Override
    public CompraReporteDTO reportePeriodo(LocalDate ini, LocalDate fin) {

        Object[] r = compRepo.reportePeriodo(
                ini.atStartOfDay(),
                fin.atTime(23,59,59)
        );

        Object[] x = (Object[]) r[0];

        return new CompraReporteDTO(
                ((Number)x[0]).longValue(),
                ((Number)x[1]).doubleValue(),
                ((Number)x[2]).longValue(),
                ((Number)x[3]).longValue()
        );
    }
}
