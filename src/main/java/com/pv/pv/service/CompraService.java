package com.pv.pv.service;

import com.pv.pv.dto.CompraRequestDTO;
import com.pv.pv.model.Compra;
import com.pv.pv.dto.CompraReporteDTO;
import java.time.LocalDate;
import java.util.List;

public interface CompraService {

    List<Compra> listarCompras();
    Compra guardarCompra(CompraRequestDTO dto);
    void cancelarCompra(Integer id);

    List<Compra> comprasHoy();
    List<Compra> comprasPorFecha(LocalDate fecha);

    CompraReporteDTO reporteGeneral();
    CompraReporteDTO reportePeriodo(LocalDate ini, LocalDate fin);
}
