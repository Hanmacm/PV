package com.pv.pv.controller;

import com.pv.pv.dto.PedidoRequest;
import com.pv.pv.model.Pedido;
import com.pv.pv.model.PedidoDetalle;
import com.pv.pv.model.Venta;
import com.pv.pv.service.PedidoService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin("*")
public class PedidoController {

    private final PedidoService srv;

    public PedidoController(PedidoService srv) {
        this.srv = srv;
    }

    @PostMapping("/guardar")
    public Pedido save(@RequestBody PedidoRequest rq) {
        return srv.save(rq);
    }

    @GetMapping("/listar")
    public List<Pedido> list() {
        return srv.list();
    }

    @GetMapping("/{id}/detalle")
    public List<PedidoDetalle> det(@PathVariable Integer id) {
        return srv.det(id);
    }

    @PutMapping("/estado/{id}")
    public Pedido chg(@PathVariable Integer id, @RequestParam String estado) {
        return srv.chg(id, estado);
    }

    @DeleteMapping("/eliminar/{id}")
    public void del(@PathVariable Integer id) {
        srv.del(id);
    }

    @PostMapping("/convertir/{id}")
    public Venta conv(@PathVariable Integer id) {
        return srv.conv(id);
    }

    @GetMapping("/reporte/periodo")
    public Map<String, Object> rep(
            @RequestParam String inicio,
            @RequestParam String fin
    ) {
        LocalDateTime i = LocalDate.parse(inicio).atStartOfDay();
        LocalDateTime f = LocalDate.parse(fin).atTime(23,59,59);
        return srv.rep(i, f);
    }

    @GetMapping("/hoy")
    public List<Pedido> hoy() {
        return srv.hoy();
    }

    @GetMapping("/fecha")
    public List<Pedido> porFecha(@RequestParam String fecha) {
        return srv.byDate(LocalDate.parse(fecha));
    }
}
