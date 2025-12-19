package com.pv.pv.service;

import com.pv.pv.dto.PedidoRequest;
import com.pv.pv.model.Pedido;
import com.pv.pv.model.PedidoDetalle;
import com.pv.pv.model.Venta;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface PedidoService {

    Pedido save(PedidoRequest rq);
    List<Pedido> list();
    Pedido chg(Integer id, String st);
    void del(Integer id);
    List<PedidoDetalle> det(Integer id);
    Venta conv(Integer id);
    Map<String, Object> rep(LocalDateTime i, LocalDateTime f);
    List<Pedido> hoy();
    List<Pedido> byDate(LocalDate f);
}
