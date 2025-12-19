package com.pv.pv.dto;

import lombok.Data;

import java.util.List;
@Data
public class CompraRequestDTO {
    private Integer proveedorId;
    private Integer usuarioId;
    private String folio;
    private String fecha;
    private List<CompraDetalleDTO> detalle;
}
