package com.pv.pv.service.impl;

import com.pv.pv.model.Usuarios;
import com.pv.pv.repository.UsuariosRepository;
import com.pv.pv.service.UsuariosService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class UsuariosServiceImpl implements UsuariosService {

    private final UsuariosRepository repo;

    public UsuariosServiceImpl(UsuariosRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Usuarios> listar() {
        return repo.findAll();
    }

    @Override
    public Usuarios guardar(Usuarios u) {

        if (repo.existsByUser(u.getUser()))
            throw new RuntimeException("Usuario ya existe");

        u.setFechaRegistro(
                LocalDateTime.now().format(
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                )
        );

        return repo.save(u);
    }

    @Override
    public Usuarios actualizar(Integer id, Usuarios u) {

        Usuarios o = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("No encontrado"));

        o.setUser(u.getUser());
        o.setPass(u.getPass());
        o.setNombre(u.getNombre());
        o.setRol(u.getRol());
        o.setTelefono(u.getTelefono());
        o.setCorreo(u.getCorreo());

        return repo.save(o);
    }

    @Override
    public void eliminar(Integer id) {
        repo.deleteById(id);
    }

    @Override
    public List<Usuarios> buscar(String txt, String rol) {

        if ((txt == null || txt.isEmpty()) && (rol == null || rol.isEmpty()))
            return repo.findAll();

        if (rol != null && !rol.isEmpty() && txt != null && !txt.isEmpty())
            return repo.buscarTextoYRol(txt, rol);

        if (rol != null && !rol.isEmpty())
            return repo.findByRol(rol);

        return repo.buscarTexto(txt);
    }
}
