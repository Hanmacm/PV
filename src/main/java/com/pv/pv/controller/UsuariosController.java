package com.pv.pv.controller;

import com.pv.pv.model.Usuarios;
import com.pv.pv.service.UsuariosService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin("*")
public class UsuariosController {

    private final UsuariosService uSvc;

    public UsuariosController(UsuariosService uSvc) {
        this.uSvc = uSvc;
    }

    @GetMapping("/listar")
    public List<Usuarios> listar() {
        return uSvc.listar();
    }

    @PostMapping("/guardar")
    public Usuarios guardar(@RequestBody Usuarios u) {
        return uSvc.guardar(u);
    }

    @PutMapping("/actualizar/{id}")
    public Usuarios actualizar(@PathVariable Integer id, @RequestBody Usuarios u) {
        return uSvc.actualizar(id, u);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        uSvc.eliminar(id);
    }

    @GetMapping("/buscar")
    public List<Usuarios> buscar(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) String rol
    ) {
        return uSvc.buscar(texto, rol);
    }
}
