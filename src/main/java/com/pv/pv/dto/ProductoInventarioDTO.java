package com.pv.pv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductoInventarioDTO {
    private String nombre;
    private Integer existencia;
}
