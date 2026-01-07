package com.pv.pv.controller;

import com.pv.pv.dto.VentaRequest;
import com.pv.pv.model.Venta;
import com.pv.pv.service.VentaService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin("*")
public class VentaController {

    private final VentaService vSvc;

    public VentaController(VentaService vSvc) {
        this.vSvc = vSvc;
    }

    @PostMapping("/guardar")
    public Venta guardar(@RequestBody VentaRequest vReq) {
        return vSvc.guardar(vReq);
    }

    @GetMapping("/listar")
    public List<Venta> listar() {
        return vSvc.listar();
    }

    @GetMapping("/hoy")
    public List<Venta> hoy() {
        return vSvc.ventasHoy();
    }

    @GetMapping("/fecha")
    public List<Venta> porFecha(@RequestParam("fecha") String f) {
        return vSvc.ventasPorFecha(f);
    }


    @GetMapping("/{id}")
    public Venta obtener(@PathVariable Integer id) {
        return vSvc.obtener(id);
    }

    @PutMapping("/cancelar/{id}")
    public Venta cancelar(@PathVariable Integer id) {
        return vSvc.cancelar(id);
    }

    @GetMapping("/reporte/periodo")
    public Map<String,Object> rpt(
            @RequestParam String inicio,
            @RequestParam String fin
    ) {
        LocalDateTime ini = LocalDate.parse(inicio).atStartOfDay();
        LocalDateTime fn  = LocalDate.parse(fin).atTime(23,59,59);

        Map<String,Object> m = new HashMap<>();
        m.put("total", vSvc.totalPagadoPeriodo(ini, fn));
        m.put("cantidad", vSvc.totalVentasPeriodo(ini, fn));
        m.put("canceladas", vSvc.totalCanceladasPeriodo(ini, fn));
        return m;
    }

    @GetMapping("/facturables")
    public List<Venta> facturables() {
        return vSvc.ventasFacturables();
    }
}
