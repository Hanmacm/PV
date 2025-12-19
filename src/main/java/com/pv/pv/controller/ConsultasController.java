package com.pv.pv.controller;

import com.pv.pv.dto.consultas.ConsultasResponseDTO;
import com.pv.pv.service.ConsultasService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultas")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ConsultasController {

    private final ConsultasService srv;

    @GetMapping
    public ConsultasResponseDTO run(@RequestParam String texto) {
        return srv.buscarGlobal(texto);
    }
}
