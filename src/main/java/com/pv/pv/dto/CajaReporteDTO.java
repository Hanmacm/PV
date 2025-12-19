package com.pv.pv.dto;

import lombok.Data;

@Data
public class CajaReporteDTO {

    private Long totalCajas;
    private Long cajasAbiertas;
    private Long cajasCerradas;

    private Double totalEntradas;
    private Double totalSalidas;
    private Double balance;

    private Integer ultimaCajaAbiertaId;
    private Integer ultimaCajaCerradaId;
}
