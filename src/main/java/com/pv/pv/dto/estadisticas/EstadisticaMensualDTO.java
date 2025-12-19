package com.pv.pv.dto.estadisticas;

import lombok.Data;

@Data
public class EstadisticaMensualDTO {

    private double[] vm = new double[12];
    private double[] cm = new double[12];
    private double[] gm = new double[12];
}
