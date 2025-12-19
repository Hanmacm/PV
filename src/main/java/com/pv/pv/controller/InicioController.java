package com.pv.pv.controller;

import com.pv.pv.dto.InicioDashboardDTO;
import com.pv.pv.service.InicioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inicio")
public class InicioController {

    private final InicioService srv;

    public InicioController(InicioService srv) {
        this.srv = srv;
    }

    @GetMapping("/dashboard")
    public InicioDashboardDTO dash(@RequestParam String filtro) {
        return srv.cargarDashboard(filtro);
    }
}
