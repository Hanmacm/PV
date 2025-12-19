package com.pv.pv.controller;

import com.pv.pv.model.Producto;
import com.pv.pv.service.ProductoService;
import com.pv.pv.dto.ProductoInventarioDTO;
import com.pv.pv.dto.ProductoReporteDTO;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin("*")
public class ProductoController {

    private final ProductoService svc;

    public ProductoController(ProductoService svc) {
        this.svc = svc;
    }

    @GetMapping
    public List<Producto> lst() {
        return svc.listar();
    }

    @PostMapping
    public Producto add(@RequestBody Producto p) {
        return svc.guardar(p);
    }

    @GetMapping("/{id}")
    public Producto one(@PathVariable Integer id) {
        return svc.buscar(id);
    }

    @GetMapping("/activos")
    public List<Producto> act() {
        return svc.listarActivos();
    }

    @PutMapping("/estado/{id}")
    public void tog(@PathVariable Integer id) {
        svc.cambiarEstado(id);
    }

    @GetMapping("/buscar")
    public List<Producto> find(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) String estado
    ) {
        return svc.buscarFiltrado(texto, estado);
    }

    @GetMapping("/alertas")
    public List<ProductoInventarioDTO> alrt() {
        return svc.inventarioBajo();
    }

    @GetMapping("/reporte")
    public ProductoReporteDTO rep() {
        return svc.reporteProductos();
    }
}
