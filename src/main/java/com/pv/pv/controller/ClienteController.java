package com.pv.pv.controller;

import com.pv.pv.dto.ClienteReporteDTO;
import com.pv.pv.model.Cliente;
import com.pv.pv.service.ClienteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin("*")
public class ClienteController {

    private final ClienteService srv;

    public ClienteController(ClienteService srv) {
        this.srv = srv;
    }

    @GetMapping
    public List<Cliente> all() {
        return srv.listar();
    }

    @PostMapping
    public Cliente save(@RequestBody Cliente c) {
        return srv.guardar(c);
    }

    @PutMapping("/{id}")
    public Cliente upd(@PathVariable Integer id, @RequestBody Cliente c) {
        c.setId(id);
        return srv.guardar(c);
    }

    @GetMapping("/activos")
    public List<Cliente> activos() {
        return srv.listarActivos();
    }

    @PutMapping("/estado/{id}")
    public void estado(@PathVariable Integer id) {
        srv.cambiarEstado(id);
    }

    @GetMapping("/buscar")
    public List<Cliente> buscar(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) String estado
    ) {
        return srv.buscarFiltrado(texto, estado);
    }

    @GetMapping("/reporte")
    public ClienteReporteDTO reporte() {
        return srv.reporteClientes();
    }
}
