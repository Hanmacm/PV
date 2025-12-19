package com.pv.pv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompraDetalleViewDTO {
    private String producto;
    private Integer cantidad;
    private Double costo;
    private Double subtotal;
}
