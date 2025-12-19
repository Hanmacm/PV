package com.pv.pv.controller;

import com.pv.pv.dto.estadisticas.*;
import com.pv.pv.service.EstadisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estadisticas")
@CrossOrigin("*")
@RequiredArgsConstructor
public class EstadisticasController {

    private final EstadisticasService srv;

    @GetMapping("/totales")
    public TotalesDTO tot() {
        return srv.obtenerTotales();
    }

    @GetMapping("/mensual")
    public EstadisticaMensualDTO mes() {
        return srv.obtenerMensual();
    }

    @GetMapping("/top-productos")
    public TopProductosDTO top() {
        return srv.obtenerTopProductos();
    }
}
