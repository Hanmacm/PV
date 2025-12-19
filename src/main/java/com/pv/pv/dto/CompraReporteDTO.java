package com.pv.pv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompraReporteDTO {
    private Long totalCompras;
    private Double montoTotal;
    private Long comprasCanceladas;
    private Long comprasRegistradas;
}
