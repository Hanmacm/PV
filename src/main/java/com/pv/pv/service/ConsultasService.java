package com.pv.pv.service;

import com.pv.pv.dto.consultas.ConsultasResponseDTO;

public interface ConsultasService {
    ConsultasResponseDTO buscarGlobal(String txt);
}
