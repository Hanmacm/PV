package com.pv.pv.dto;

import lombok.Data;
import java.util.List;

@Data
public class VentaRequest {

    private Integer clienteId;
    private Integer usuarioId;
    private String metodoPago;
    private Double total;

    private List<Detalle> detalles;

    @Data
    public static class Detalle {
        private Integer productoId;
        private Integer cantidad;
        private Double precio;
    }
}
