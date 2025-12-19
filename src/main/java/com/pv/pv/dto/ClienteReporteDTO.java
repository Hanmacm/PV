package com.pv.pv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClienteReporteDTO {
    private Long total;
    private Long activos;
    private Long inactivos;
    private Long nuevosMes;
}
