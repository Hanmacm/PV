package com.pv.pv.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "caja_movimientos")
public class CajaMovimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "caja_id")
    @JsonBackReference
    private Caja caja;

    private String tipo;

    private Double monto;

    private String concepto;

    private LocalDateTime fecha;
}
