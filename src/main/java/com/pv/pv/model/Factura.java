package com.pv.pv.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Table(name = "facturas")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "venta_id", nullable = false, unique = true)
    private Integer ventaId;

    @Column(nullable = false)
    private String cliente;

    @Column(nullable = false, length = 13)
    private String rfc;

    @Column(name = "razon_social", nullable = false)
    private String razonSocial;

    @Column(name = "uso_cfdi", nullable = false)
    private String usoCfdi;

    @Column(nullable = false)
    private Double total;

    // 1 = timbrada, 0 = no timbrada
    private Integer timbrado;

    // ACTIVA / CANCELADA
    @Column(nullable = false)
    private String estado;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fecha;
}
