package com.pv.pv.service;

import com.pv.pv.dto.InicioDashboardDTO;

public interface InicioService {
    InicioDashboardDTO cargarDashboard(String filtro);
}
