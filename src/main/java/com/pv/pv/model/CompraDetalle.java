package com.pv.pv.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "compras_detalle")
@Data
public class CompraDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_id")
    @JsonIgnore
    private Compra compra;

    private Integer productoId;
    private Integer cantidad;
    private Double costo;
    private Double subtotal;
}


