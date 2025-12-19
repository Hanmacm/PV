package com.pv.pv.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user")
    private String usuario;

    @Column(name = "pass")
    private String password;

    private String nombre;
    private String rol;
    private String telefono;
    private String correo;

    @Column(name = "fecha_registro")
    private java.sql.Timestamp fechaRegistro;

    public Integer getId() { return id; }
    public String getUsuario() { return usuario; }
    public String getPassword() { return password; }
    public String getNombre() { return nombre; }
    public String getRol() { return rol; }
    public String getTelefono() { return telefono; }
    public String getCorreo() { return correo; }
    public java.sql.Timestamp getFechaRegistro() { return fechaRegistro; }
}
