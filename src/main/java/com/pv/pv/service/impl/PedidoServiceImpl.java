package com.pv.pv.service.impl;

import com.pv.pv.dto.PedidoRequest;
import com.pv.pv.model.*;
import com.pv.pv.repository.*;
import com.pv.pv.service.CajaService;
import com.pv.pv.service.PedidoService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedRepo;
    private final PedidoDetalleRepository detRepo;
    private final ClienteRepository cliRepo;
    private final ProductoRepository prodRepo;
    private final VentaRepository venRepo;
    private final CajaService cajaSrv;

    public PedidoServiceImpl(
            PedidoRepository pedRepo,
            PedidoDetalleRepository detRepo,
            ClienteRepository cliRepo,
            ProductoRepository prodRepo,
            VentaRepository venRepo,
            CajaService cajaSrv
    ) {
        this.pedRepo = pedRepo;
        this.detRepo = detRepo;
        this.cliRepo = cliRepo;
        this.prodRepo = prodRepo;
        this.venRepo = venRepo;
        this.cajaSrv = cajaSrv;
    }

    @Override
    public List<PedidoDetalle> det(Integer id) {
        return detRepo.findByPedidoId(id);
    }

    @Override
    public Pedido save(PedidoRequest rq) {

        Cliente c = cliRepo.findById(rq.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Pedido p = new Pedido();
        p.setCliente(c);
        p.setEstado(rq.getEstado());
        p.setDireccionEntrega(rq.getDireccion());

        double tot = 0;
        List<PedidoDetalle> lst = new ArrayList<>();

        for (PedidoRequest.Detalle d : rq.getDetalles()) {

            Producto pr = prodRepo.findById(d.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            double sub = pr.getPrecio() * d.getCantidad();
            tot += sub;

            PedidoDetalle det = new PedidoDetalle();
            det.setPedido(p);
            det.setProducto(pr);
            det.setCantidad(d.getCantidad());
            det.setPrecio(pr.getPrecio());
            det.setSubtotal(sub);

            lst.add(det);
        }

        p.setTotal(tot);
        p.setDetalles(lst);

        return pedRepo.save(p);
    }

    @Transactional
    @Override
    public Venta conv(Integer id) {

        Pedido p = pedRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido inexistente"));

        if ("Convertido".equalsIgnoreCase(p.getEstado())) {
            throw new RuntimeException("Este pedido ya fue convertido");
        }

        Venta v = new Venta();
        v.setClienteId(p.getCliente().getId());
        v.setFecha(LocalDateTime.now());
        v.setMetodoPago("pedido");
        v.setEstado("PAGADA");
        v.setTotal(p.getTotal());

        List<VentaDetalle> dts = new ArrayList<>();

        for (PedidoDetalle d : p.getDetalles()) {

            Producto pr = prodRepo.findById(d.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no disponible"));

            if (pr.getStock() < d.getCantidad()) {
                throw new RuntimeException("Stock insuficiente: " + pr.getNombre());
            }

            pr.setStock(pr.getStock() - d.getCantidad());
            prodRepo.save(pr);

            VentaDetalle vd = new VentaDetalle();
            vd.setVenta(v);
            vd.setProductoId(pr.getId());
            vd.setCantidad(d.getCantidad());
            vd.setPrecio(d.getPrecio());
            vd.setSubtotal(d.getSubtotal());

            dts.add(vd);
        }

        v.setDetalles(dts);
        Venta vg = venRepo.save(v);

        p.setEstado("Convertido");
        pedRepo.save(p);

        cajaSrv.registrarMovimiento(
                "Entrada",
                vg.getTotal(),
                "Pedido convertido #" + vg.getId()
        );

        return vg;
    }

    @Override
    public List<Pedido> list() {
        return pedRepo.findAll();
    }

    @Override
    public Pedido chg(Integer id, String st) {
        Pedido p = pedRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        p.setEstado(st);
        return pedRepo.save(p);
    }

    @Override
    public void del(Integer id) {
        pedRepo.deleteById(id);
    }

    @Override
    public Map<String, Object> rep(LocalDateTime i, LocalDateTime f) {
        Map<String, Object> m = new HashMap<>();
        m.put("total", pedRepo.totalPeriodo(i, f));
        m.put("cantidad", pedRepo.countPeriodo(i, f));
        m.put("cancelados", pedRepo.canceladosPeriodo(i, f));
        return m;
    }

    @Override
    public List<Pedido> hoy() {
        return pedRepo.pedidosHoy();
    }

    @Override
    public List<Pedido> byDate(LocalDate f) {
        return pedRepo.pedidosPorRango(
                f.atStartOfDay(),
                f.atTime(23,59,59)
        );
    }
}
