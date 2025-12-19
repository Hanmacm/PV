package com.pv.pv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductoReporteDTO {

    private Long totalProductos;
    private Long activos;
    private Long inactivos;
    private Long stockBajo;
    private Double valorInventario;
}
