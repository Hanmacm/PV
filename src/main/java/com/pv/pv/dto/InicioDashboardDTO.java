package com.pv.pv.dto;

import lombok.Data;
import java.util.List;

@Data
public class InicioDashboardDTO {

    private double ventasDia;
    private int ticketsDia;
    private double ticketPromedio;

    private List<VentaResumenDTO> ultimasVentas;
    private List<MetodoDTO> ventasPorMetodo;
    private List<TopProductoDTO> topProductos;

    private List<ProductoInventarioDTO> productosBajoInventario;
    private CajaDTO cajaActual;
}
