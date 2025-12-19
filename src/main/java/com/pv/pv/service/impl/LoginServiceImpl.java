package com.pv.pv.service.impl;

import com.pv.pv.model.Usuario;
import com.pv.pv.repository.UsuarioRepository;
import com.pv.pv.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private UsuarioRepository repo;

    @Override
    public Usuario validar(String usr, String pwd) {
        Usuario u = repo.findByUsuario(usr);
        if (u != null && u.getPassword().equals(pwd)) {
            return u;
        }
        return null;
    }

    @Override
    public Usuario buscarPorUsuario(String usr) {
        return repo.findByUsuario(usr);
    }
}
