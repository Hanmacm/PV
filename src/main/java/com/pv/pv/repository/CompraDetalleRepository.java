package com.pv.pv.repository;

import com.pv.pv.model.CompraDetalle;

import java.time.LocalDate;
import java.util.List;
import com.pv.pv.dto.CompraDetalleViewDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CompraDetalleRepository extends JpaRepository<CompraDetalle, Integer> {
    List<CompraDetalle> findByCompraId(Integer compraId);
@Query("""
    SELECT new com.pv.pv.dto.CompraDetalleViewDTO(
        p.nombre,
        d.cantidad,
        d.costo,
        d.subtotal
    )
    FROM CompraDetalle d
    JOIN Producto p ON p.id = d.productoId
    WHERE d.compra.id = :compraId
""")
List<CompraDetalleViewDTO> detalleCompra(Integer compraId);
@Query("""
    SELECT COUNT(c)
    FROM Compra c
""")
Long totalCompras();

@Query("""
    SELECT COALESCE(SUM(c.total), 0)
    FROM Compra c
    WHERE c.estado = 'REGISTRADA'
""")
Double montoTotal();

@Query("""
    SELECT COUNT(c)
    FROM Compra c
    WHERE c.estado = 'CANCELADA'
""")
Long comprasCanceladas();

@Query("""
    SELECT COUNT(c)
    FROM Compra c
    WHERE c.estado = 'REGISTRADA'
""")
Long comprasRegistradas();

@Query("""
    SELECT COUNT(c), COALESCE(SUM(c.total),0),
           SUM(CASE WHEN c.estado='CANCELADA' THEN 1 ELSE 0 END),
           SUM(CASE WHEN c.estado='REGISTRADA' THEN 1 ELSE 0 END)
    FROM Compra c
    WHERE DATE(c.fecha) BETWEEN :inicio AND :fin
""")
Object[] reportePeriodo(LocalDate inicio, LocalDate fin);

}
