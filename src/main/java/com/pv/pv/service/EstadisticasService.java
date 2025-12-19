package com.pv.pv.service;

import com.pv.pv.dto.estadisticas.*;

public interface EstadisticasService {

    TotalesDTO obtenerTotales();

    EstadisticaMensualDTO obtenerMensual();

    TopProductosDTO obtenerTopProductos();
}
