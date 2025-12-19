package com.pv.pv.service;

import com.pv.pv.model.Usuario;

public interface LoginService {
    Usuario validar(String usr, String pwd);
    Usuario buscarPorUsuario(String usr);
}
