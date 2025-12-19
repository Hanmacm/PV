package com.pv.pv.service;

import com.pv.pv.model.Factura;

import java.time.LocalDateTime;
import java.util.List;

public interface FacturaService {

    List<Factura> lst();
    Factura save(Factura f);
    void cnl(Integer id);

    Double tot();
    Long act();
    Long cnlCnt();
    Double totCnl();

    List<Factura> per(LocalDateTime ini, LocalDateTime fin);
}
