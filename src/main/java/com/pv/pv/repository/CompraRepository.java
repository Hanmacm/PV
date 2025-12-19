package com.pv.pv.repository;

import com.pv.pv.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface CompraRepository extends JpaRepository<Compra, Integer> {

    @Query("""
        SELECT c FROM Compra c
        WHERE LOWER(COALESCE(c.folio, '')) LIKE %:texto%
    """)
    List<Compra> buscarPorTexto(String texto);
    @Transactional
@Modifying
@Query("UPDATE Compra c SET c.estado = 'CANCELADA' WHERE c.id = :id")
void cancelarCompra(Integer id);
@Query("""
    SELECT c FROM Compra c
    WHERE DATE(c.fecha) = CURRENT_DATE
    ORDER BY c.fecha DESC
""")
List<Compra> comprasHoy();

@Query("""
    SELECT c FROM Compra c
    WHERE DATE(c.fecha) = :fecha
    ORDER BY c.fecha DESC
""")
List<Compra> comprasPorFecha(LocalDate fecha);
@Query("SELECT COUNT(c) FROM Compra c")
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
    SELECT 
        COUNT(c), 
        COALESCE(SUM(c.total), 0),
        SUM(CASE WHEN c.estado = 'CANCELADA' THEN 1 ELSE 0 END),
        SUM(CASE WHEN c.estado = 'REGISTRADA' THEN 1 ELSE 0 END)
    FROM Compra c
    WHERE c.fecha BETWEEN :inicio AND :fin
""")
Object[] reportePeriodo(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
);

    boolean existsByProveedorId(Integer proveedorId);

}
