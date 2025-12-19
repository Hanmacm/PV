package com.pv.pv.repository;

import com.pv.pv.model.Venta;
import com.pv.pv.model.Compra;
import com.pv.pv.dto.TopProductoDTO;
import org.springframework.data.jpa.repository.*;
import java.time.LocalDateTime;
import java.util.List;

public interface ReportesRepository extends JpaRepository<Venta, Integer> {

    @Query("""
        SELECT v FROM Venta v
        WHERE v.fecha BETWEEN :ini AND :fin
        ORDER BY v.fecha ASC
    """)
    List<Venta> ventasPorFechas(LocalDateTime ini, LocalDateTime fin);

    @Query("""
        SELECT c FROM Compra c
        WHERE c.fecha BETWEEN :ini AND :fin
        ORDER BY c.fecha ASC
    """)
    List<Compra> comprasPorFechas(LocalDateTime ini, LocalDateTime fin);

    @Query("""
        SELECT new com.pv.pv.dto.TopProductoDTO(
            p.nombre,
            SUM(d.cantidad)
        )
        FROM VentaDetalle d
        JOIN Venta v ON v.id = d.venta.id
        JOIN Producto p ON p.id = d.productoId
        WHERE v.fecha BETWEEN :ini AND :fin
        GROUP BY p.nombre
        ORDER BY SUM(d.cantidad) DESC
    """)
    List<TopProductoDTO> topProductosPorFechas(LocalDateTime ini, LocalDateTime fin);
}
