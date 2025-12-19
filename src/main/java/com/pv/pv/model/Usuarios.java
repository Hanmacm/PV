package com.pv.pv.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuarios")
public class Usuarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String user;

    private String pass;
    private String nombre;

    @Column(nullable = false)
    private String rol;

    private String telefono;
    private String correo;

    @Column(name = "fecha_registro")
    private String fechaRegistro;
}
