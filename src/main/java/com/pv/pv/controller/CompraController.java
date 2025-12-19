package com.pv.pv.controller;

import com.pv.pv.dto.CompraDetalleViewDTO;
import com.pv.pv.dto.CompraRequestDTO;
import com.pv.pv.model.Compra;
import com.pv.pv.repository.CompraDetalleRepository;
import com.pv.pv.service.CompraService;
import com.pv.pv.dto.CompraReporteDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin("*")
public class CompraController {

    @Autowired
    private CompraService compSrv;

    @Autowired
    private CompraDetalleRepository detRepo;

    @GetMapping
    public List<Compra> all() {
        return compSrv.listarCompras();
    }

    @PostMapping
    public Compra save(@RequestBody CompraRequestDTO req) {
        return compSrv.guardarCompra(req);
    }

    @PutMapping("/cancelar/{id}")
    public void cancel(@PathVariable Integer id) {
        compSrv.cancelarCompra(id);
    }

    @GetMapping("/hoy")
    public List<Compra> hoy() {
        return compSrv.comprasHoy();
    }

    @GetMapping("/fecha")
    public List<Compra> porFecha(@RequestParam String fecha) {
        return compSrv.comprasPorFecha(LocalDate.parse(fecha));
    }

    @GetMapping("/{id}/detalle")
    public List<CompraDetalleViewDTO> det(@PathVariable Integer id) {
        return detRepo.detalleCompra(id);
    }

    @GetMapping("/reporte")
    public CompraReporteDTO rep() {
        return compSrv.reporteGeneral();
    }

    @GetMapping("/reporte/periodo")
    public CompraReporteDTO repFechas(
            @RequestParam String inicio,
            @RequestParam String fin
    ) {
        return compSrv.reportePeriodo(
                LocalDate.parse(inicio),
                LocalDate.parse(fin)
        );
    }
}


