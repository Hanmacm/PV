package com.pv.pv.repository;

import com.pv.pv.model.PedidoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoDetalleRepository extends JpaRepository<PedidoDetalle, Integer> {

    List<PedidoDetalle> findByPedidoId(Integer pedidoId);

}
