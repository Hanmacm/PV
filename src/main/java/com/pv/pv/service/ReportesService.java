package com.pv.pv.service;

import com.pv.pv.dto.reportes.ReporteGeneralDTO;

public interface ReportesService {

    ReporteGeneralDTO generarReporte(String desde, String hasta);
}
