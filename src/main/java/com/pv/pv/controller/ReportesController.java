package com.pv.pv.controller;

import com.pv.pv.dto.reportes.ReporteGeneralDTO;
import com.pv.pv.service.ReportesService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService svc;

    @GetMapping("/general")
    public ReporteGeneralDTO gen(
            @RequestParam String desde,
            @RequestParam String hasta
    ) {
        return svc.generarReporte(desde, hasta);
    }
}
