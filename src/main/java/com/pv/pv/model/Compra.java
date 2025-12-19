package com.pv.pv.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "compras")
@Data
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer proveedorId;
    private Integer usuarioId;
    private String folio;
    private LocalDateTime fecha;
    private Double total;
    private String estado;

    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("compra")
    private List<CompraDetalle> detalle;
}
