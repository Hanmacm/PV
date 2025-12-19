package com.pv.pv.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "cajas")
public class Caja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "monto_inicial")
    private Double montoInicial;

    @Column(name = "monto_final")
    private Double montoFinal;

    private String estado;

    @OneToMany(mappedBy = "caja", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CajaMovimiento> movimientos = new ArrayList<>();
}
