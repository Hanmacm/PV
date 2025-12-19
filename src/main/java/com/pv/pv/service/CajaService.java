package com.pv.pv.service;

import com.pv.pv.dto.CajaReporteDTO;
import com.pv.pv.model.Caja;
import com.pv.pv.model.CajaMovimiento;

import java.util.List;

public interface CajaService {

    Caja abrirCaja(Double monto, Integer usuario);

    Caja cerrarCaja();

    CajaMovimiento registrarMovimiento(String tipo, Double monto, String detalle);

    Caja obtenerCajaActual();

    List<Caja> historial();

    List<CajaMovimiento> movimientosPorCaja(Integer idCaja);

    CajaReporteDTO reporteCajas();
}
