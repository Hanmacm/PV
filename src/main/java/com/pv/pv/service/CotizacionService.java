package com.pv.pv.service;

import com.pv.pv.dto.CotizacionRequest;
import com.pv.pv.model.Cotizacion;
import com.pv.pv.model.Venta;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface CotizacionService {

    Cotizacion guardarCotizacion(CotizacionRequest r);

    List<Cotizacion> listar();

    Cotizacion obtener(Integer id);

    Cotizacion actualizar(Integer id, CotizacionRequest r);

    void eliminar(Integer id);

    Venta convertirAVenta(Integer id);

    List<Cotizacion> cotizacionesHoy();

    List<Cotizacion> cotizacionesPorFecha(String fecha);

    void cancelar(Integer id);

    Map<String,Object> reportePeriodo(LocalDateTime i, LocalDateTime f);
}
