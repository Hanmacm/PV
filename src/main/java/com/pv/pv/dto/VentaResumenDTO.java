package com.pv.pv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VentaResumenDTO {

    private Integer id;
    private Object fecha;
    private String cliente;
    private String metodo;
    private Double total;
    private String estado;
}
