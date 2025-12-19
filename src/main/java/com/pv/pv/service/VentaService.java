package com.pv.pv.service;

import com.pv.pv.dto.VentaRequest;
import com.pv.pv.model.Venta;
import java.time.LocalDateTime;
import java.util.List;

public interface VentaService {

    Venta guardar(VentaRequest vReq);

    List<Venta> listar();

    List<Venta> ventasHoy();

    List<Venta> ventasPorFecha(String f);

    Venta obtener(Integer id);

    Venta cancelar(Integer id);

    Double totalPagadoPeriodo(LocalDateTime ini, LocalDateTime fn);

    Long totalVentasPeriodo(LocalDateTime ini, LocalDateTime fn);

    Long totalCanceladasPeriodo(LocalDateTime ini, LocalDateTime fn);

    List<Venta> ventasFacturables();
}
