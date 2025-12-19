package com.pv.pv.dto.reportes;

import lombok.Data;
import java.util.List;

@Data
public class ReporteGeneralDTO {

    private double totalVentas;
    private double totalCompras;
    private double ganancias;

    private int cantidadVentas;
    private int cantidadCompras;

    private double ticketPromedio;

    private List<?> ventas;
    private List<?> compras;

    private List<String> nombresProductos;
    private List<Long> cantidadesProductos;
}
