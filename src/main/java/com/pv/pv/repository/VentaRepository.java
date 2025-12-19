package com.pv.pv.repository;

import com.pv.pv.dto.*;
import com.pv.pv.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Integer> {

    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE v.fecha BETWEEN :ini AND :fin")
    Double totalPeriodo(LocalDateTime ini, LocalDateTime fin);

    @Query("SELECT COUNT(v) FROM Venta v WHERE v.fecha BETWEEN :ini AND :fin")
    Integer countPeriodo(LocalDateTime ini, LocalDateTime fin);

    @Query("""
        SELECT new com.pv.pv.dto.VentaResumenDTO(
            v.id,
            v.fecha,
            CONCAT('Cliente #', v.clienteId),
            v.metodoPago,
            v.total,
            'Pagado'
        )
        FROM Venta v ORDER BY v.fecha DESC LIMIT 10
    """)
    List<VentaResumenDTO> ultimasVentas();

    @Query("""
        SELECT new com.pv.pv.dto.MetodoDTO(
            v.metodoPago,
            SUM(v.total)
        )
        FROM Venta v GROUP BY v.metodoPago
    """)
    List<MetodoDTO> ventasPorMetodo();

    @Query("""
        SELECT new com.pv.pv.dto.TopProductoDTO(
            p.nombre,
            SUM(d.cantidad)
        )
        FROM VentaDetalle d
        JOIN Producto p ON p.id = d.productoId
        GROUP BY p.nombre
        ORDER BY SUM(d.cantidad) DESC
    """)
    List<TopProductoDTO> topProductos();

    // 🔍 NUEVO: búsqueda para consultas globales
    @Query("""
        SELECT v FROM Venta v
        WHERE LOWER(COALESCE(v.metodoPago, '')) LIKE %:texto%
    """)
    List<Venta> buscarPorTexto(String texto);
    
@Query("""
    SELECT v FROM Venta v
    WHERE v.fecha BETWEEN :inicio AND :fin
    ORDER BY v.fecha DESC
""")
List<Venta> ventasPorPeriodo(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
);
@Query("""
    SELECT v FROM Venta v
    LEFT JOIN FETCH v.detalles
    WHERE v.id = :id
""")
Venta buscarConDetalle(Integer id);

@Query("""
    SELECT COALESCE(SUM(v.total),0)
    FROM Venta v
    WHERE v.estado = 'PAGADA'
      AND v.fecha BETWEEN :ini AND :fin
""")
Double totalPagadoPeriodo(
    @Param("ini") LocalDateTime ini,
    @Param("fin") LocalDateTime fin
);

@Query("""
    SELECT COUNT(v)
    FROM Venta v
    WHERE v.fecha BETWEEN :ini AND :fin
""")
Long totalVentasPeriodo(
    @Param("ini") LocalDateTime ini,
    @Param("fin") LocalDateTime fin
);

@Query("""
    SELECT COUNT(v)
    FROM Venta v
    WHERE v.estado = 'CANCELADA'
      AND v.fecha BETWEEN :ini AND :fin
""")
Long totalCanceladasPeriodo(
    @Param("ini") LocalDateTime ini,
    @Param("fin") LocalDateTime fin
);
@Query("""
    SELECT v
    FROM Venta v
    WHERE v.estado = 'PAGADA'
    ORDER BY v.fecha DESC
""")
List<Venta> ventasFacturables();

}
