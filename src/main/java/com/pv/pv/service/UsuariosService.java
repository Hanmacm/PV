package com.pv.pv.service;

import com.pv.pv.model.Usuarios;
import java.util.List;

public interface UsuariosService {

    List<Usuarios> listar();

    Usuarios guardar(Usuarios u);

    Usuarios actualizar(Integer id, Usuarios u);

    void eliminar(Integer id);

    List<Usuarios> buscar(String texto, String rol);
}
