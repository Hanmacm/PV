package com.pv.pv.dto;

import com.pv.pv.model.Usuario;

public class LoginResponse {

    private boolean ok;
    private Usuario usuario;
    private String mensaje;

    public LoginResponse() {}

    public LoginResponse(boolean ok, Usuario usuario, String mensaje) {
        this.ok = ok;
        this.usuario = usuario;
        this.mensaje = mensaje;
    }

    public boolean isOk() { return ok; }
    public void setOk(boolean ok) { this.ok = ok; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}
