package com.pv.pv.controller;

import com.pv.pv.model.Factura;
import com.pv.pv.service.FacturaService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/facturas")
public class FacturaController {

    private final FacturaService srv;

    public FacturaController(FacturaService srv) {
        this.srv = srv;
    }

    @GetMapping("/listar")
    public List<Factura> lst() {
        return srv.lst();
    }

    @PostMapping("/guardar")
    public Factura save(@RequestBody Factura f) {
        return srv.save(f);
    }

    @PutMapping("/cancelar/{id}")
    public void cnl(@PathVariable Integer id) {
        srv.cnl(id);
    }

    @GetMapping("/reportes/kpis")
    public Map<String, Object> kpi() {
        Map<String, Object> r = new HashMap<>();
        r.put("totalFacturado", srv.tot());
        r.put("facturasActivas", srv.act());
        r.put("facturasCanceladas", srv.cnlCnt());
        r.put("totalCancelado", srv.totCnl());
        return r;
    }

    @GetMapping("/reportes/periodo")
    public List<Factura> per(
            @RequestParam String inicio,
            @RequestParam String fin
    ) {
        return srv.per(
                LocalDateTime.parse(inicio + "T00:00:00"),
                LocalDateTime.parse(fin + "T23:59:59")
        );
    }
}
