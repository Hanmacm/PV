package com.pv.pv.repository;

import com.pv.pv.model.Factura;
import org.springframework.data.jpa.repository.*;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FacturaRepository extends JpaRepository<Factura, Integer> {

    Optional<Factura> findByVentaId(Integer ventaId);

    @Modifying
    @Transactional
    @Query("UPDATE Factura f SET f.estado='CANCELADA' WHERE f.id=:id")
    void cancelarFactura(Integer id);

    @Query("SELECT COALESCE(SUM(f.total),0) FROM Factura f WHERE f.estado='ACTIVA'")
    Double totalFacturado();

    @Query("SELECT COUNT(f) FROM Factura f WHERE f.estado='ACTIVA'")
    Long facturasActivas();

    @Query("SELECT COUNT(f) FROM Factura f WHERE f.estado='CANCELADA'")
    Long facturasCanceladas();

    @Query("SELECT COALESCE(SUM(f.total),0) FROM Factura f WHERE f.estado='CANCELADA'")
    Double totalCancelado();

    @Query("SELECT f FROM Factura f WHERE f.fecha BETWEEN :ini AND :fin")
    List<Factura> facturasPorPeriodo(LocalDateTime ini, LocalDateTime fin);
}
