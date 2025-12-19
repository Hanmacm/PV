package com.pv.pv.controller;

import com.pv.pv.model.Proveedor;
import com.pv.pv.service.ProveedorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin("*")
public class ProveedorController {

    private final ProveedorService svc;

    public ProveedorController(ProveedorService svc) {
        this.svc = svc;
    }

    @GetMapping
    public List<Proveedor> lst() {
        return svc.listar();
    }

    @PostMapping
    public Proveedor add(@RequestBody Proveedor p) {
        return svc.guardar(p);
    }

    @PutMapping("/{id}")
    public Proveedor upd(@PathVariable Integer id, @RequestBody Proveedor p) {
        return svc.actualizar(id, p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> del(@PathVariable Integer id) {
        try {
            svc.desactivar(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/activar/{id}")
    public void on(@PathVariable Integer id) {
        svc.activar(id);
    }

    @GetMapping("/buscar")
    public List<Proveedor> find(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) Integer estado
    ) {
        return svc.buscar(texto, estado);
    }

    @GetMapping("/reporte")
    public ResponseEntity<byte[]> xls() {
        return svc.reporteExcel();
    }
}
