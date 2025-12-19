package com.pv.pv.controller;

import com.pv.pv.dto.LoginRequest;
import com.pv.pv.dto.LoginResponse;
import com.pv.pv.model.Usuario;
import com.pv.pv.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class LoginController {

    @Autowired
    private LoginService svc;

    @GetMapping("/login")
    public String view() {
        return "login";
    }

    @PostMapping("/api/login")
    @ResponseBody
    public LoginResponse login(@RequestBody LoginRequest req) {

        Usuario u = svc.validar(req.getUser(), req.getPass());

        if (u == null) {
            return new LoginResponse(false, null,
                    "El usuario o la contraseña no coinciden");
        }

        return new LoginResponse(true, u,
                "Sesión iniciada correctamente");
    }

    @PostMapping("/api/login/recuperar")
    @ResponseBody
    public LoginResponse recuperar(@RequestBody LoginRequest req) {

        Usuario u = svc.buscarPorUsuario(req.getUser());

        if (u == null) {
            return new LoginResponse(false, null,
                    "No existe un usuario con ese nombre");
        }

        return new LoginResponse(true, null,
                "Tu contraseña actual es: " + u.getPassword());
    }

    @GetMapping("/inicio")
    public String inicio() {
        return "inicio";
    }
}
