package com.pv.pv.service.impl;

import com.pv.pv.dto.VentaRequest;
import com.pv.pv.model.*;
import com.pv.pv.repository.*;
import com.pv.pv.service.*;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
public class VentaServiceImpl implements VentaService {

    private final VentaRepository vRepo;
    private final ProductoRepository pRepo;
    private final CajaRepository cRepo;
    private final CajaService cSvc;

    public VentaServiceImpl(
            VentaRepository vRepo,
            ProductoRepository pRepo,
            CajaRepository cRepo,
            CajaService cSvc
    ) {
        this.vRepo = vRepo;
        this.pRepo = pRepo;
        this.cRepo = cRepo;
        this.cSvc  = cSvc;
    }

    @Override
    public Venta guardar(VentaRequest vReq) {

   cRepo.findByEstado("Abierta")
     .orElseThrow(() -> new RuntimeException("Sin caja abierta"));

        Venta vta = new Venta();
        vta.setClienteId(vReq.getClienteId());
        vta.setUsuarioId(vReq.getUsuarioId());
        vta.setMetodoPago(vReq.getMetodoPago());
        vta.setTotal(vReq.getTotal());
        vta.setFecha(LocalDateTime.now());
        vta.setEstado("PAGADA");

        List<VentaDetalle> dets = new ArrayList<>();

        for (VentaRequest.Detalle d : vReq.getDetalles()) {

            VentaDetalle det = new VentaDetalle();
            det.setProductoId(d.getProductoId());
            det.setCantidad(d.getCantidad());
            det.setPrecio(d.getPrecio());
            det.setSubtotal(d.getPrecio() * d.getCantidad());
            det.setVenta(vta);
            dets.add(det);

            Producto p = pRepo.findById(d.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no existe"));

            if (!"ACTIVO".equalsIgnoreCase(p.getEstado()))
                throw new RuntimeException("Producto inactivo");

            if (p.getStock() < d.getCantidad())
                throw new RuntimeException("Stock insuficiente");

            p.setStock(p.getStock() - d.getCantidad());
            pRepo.save(p);
        }

        vta.setDetalles(dets);
        Venta ok = vRepo.save(vta);

        cSvc.registrarMovimiento(
                "Entrada",
                ok.getTotal(),
                "Venta #" + ok.getId()
        );

        return ok;
    }

    @Override
    public List<Venta> listar() {
        return vRepo.findAll();
    }

    @Override
    public List<Venta> ventasHoy() {
        LocalDate d = LocalDate.now();
        return vRepo.ventasPorPeriodo(d.atStartOfDay(), d.atTime(LocalTime.MAX));
    }

    @Override
    public List<Venta> ventasPorFecha(String f) {
        LocalDate d = LocalDate.parse(f);
        return vRepo.ventasPorPeriodo(d.atStartOfDay(), d.atTime(LocalTime.MAX));
    }

    @Override
    public Venta obtener(Integer id) {
        return vRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("No encontrada"));
    }

    @Override
    public Venta cancelar(Integer id) {

        Venta vta = vRepo.buscarConDetalle(id);
        if (vta == null) throw new RuntimeException("No existe");

        if ("CANCELADA".equalsIgnoreCase(vta.getEstado()))
            throw new RuntimeException("Ya cancelada");

        for (VentaDetalle d : vta.getDetalles()) {
            Producto p = pRepo.findById(d.getProductoId()).orElse(null);
            if (p != null) {
                p.setStock(p.getStock() + d.getCantidad());
                pRepo.save(p);
            }
        }

        vta.setEstado("CANCELADA");
        vRepo.save(vta);

        cSvc.registrarMovimiento(
                "Salida",
                vta.getTotal(),
                "Cancelación #" + vta.getId()
        );

        return vta;
    }

    @Override
    public Double totalPagadoPeriodo(LocalDateTime ini, LocalDateTime fn) {
        return vRepo.totalPagadoPeriodo(ini, fn);
    }

    @Override
    public Long totalVentasPeriodo(LocalDateTime ini, LocalDateTime fn) {
        return vRepo.totalVentasPeriodo(ini, fn);
    }

    @Override
    public Long totalCanceladasPeriodo(LocalDateTime ini, LocalDateTime fn) {
        return vRepo.totalCanceladasPeriodo(ini, fn);
    }

    @Override
    public List<Venta> ventasFacturables() {
        return vRepo.ventasFacturables();
    }
}
