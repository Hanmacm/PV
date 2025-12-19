package com.pv.pv.controller;

import com.pv.pv.dto.CotizacionRequest;
import com.pv.pv.model.Cotizacion;
import com.pv.pv.model.Venta;
import com.pv.pv.service.CotizacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cotizaciones")
@CrossOrigin("*")
public class CotizacionController {

    private final CotizacionService srv;

    @PostMapping
    public Cotizacion save(@RequestBody CotizacionRequest r){
        return srv.guardarCotizacion(r);
    }

    @GetMapping
    public List<Cotizacion> all(){
        return srv.listar();
    }

    @GetMapping("/{id}")
    public Cotizacion one(@PathVariable Integer id){
        return srv.obtener(id);
    }

    @PutMapping("/{id}")
    public Cotizacion upd(@PathVariable Integer id, @RequestBody CotizacionRequest r){
        return srv.actualizar(id, r);
    }

    @DeleteMapping("/{id}")
    public void del(@PathVariable Integer id){
        srv.eliminar(id);
    }

    @PostMapping("/convertir/{id}")
    public Venta toVenta(@PathVariable Integer id){
        return srv.convertirAVenta(id);
    }

    @GetMapping("/hoy")
    public List<Cotizacion> hoy(){
        return srv.cotizacionesHoy();
    }

    @GetMapping("/fecha")
    public List<Cotizacion> fecha(@RequestParam String fecha){
        return srv.cotizacionesPorFecha(fecha);
    }

    @PutMapping("/cancelar/{id}")
    public void cancel(@PathVariable Integer id){
        srv.cancelar(id);
    }

    @GetMapping("/reporte")
    public Map<String,Object> rep(@RequestParam String inicio, @RequestParam String fin){
        LocalDateTime i = LocalDate.parse(inicio).atStartOfDay();
        LocalDateTime f = LocalDate.parse(fin).atTime(23,59,59);
        return srv.reportePeriodo(i,f);
    }
}
