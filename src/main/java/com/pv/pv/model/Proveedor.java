package com.pv.pv.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "proveedores",
        uniqueConstraints = @UniqueConstraint(columnNames = {"nombre", "empresa"})
)
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nombre;

    private String empresa;
    private String telefono;
    private String correo;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @CreationTimestamp
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(nullable = false)
    private Integer activo = 1;
}
