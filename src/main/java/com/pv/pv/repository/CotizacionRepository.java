package com.pv.pv.repository;

import com.pv.pv.model.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Integer> {

    @Query("""
        SELECT c FROM Cotizacion c
        WHERE LOWER(COALESCE(c.estado, '')) LIKE %:texto%
           OR LOWER(COALESCE(c.notas, '')) LIKE %:texto%
    """)
    List<Cotizacion> buscarPorTexto(String texto);
    
    @Query("""
    SELECT c FROM Cotizacion c
    WHERE c.fecha BETWEEN :inicio AND :fin
    ORDER BY c.fecha DESC
""")
List<Cotizacion> cotizacionesPorPeriodo(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
);
@Query("""
    SELECT COALESCE(SUM(c.total),0)
    FROM Cotizacion c
    WHERE c.fecha BETWEEN :inicio AND :fin
""")
Double totalCotizadoPeriodo(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
);

@Query("""
    SELECT COUNT(c)
    FROM Cotizacion c
    WHERE c.fecha BETWEEN :inicio AND :fin
""")
Long totalCotizacionesPeriodo(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
);

@Query("""
    SELECT COUNT(c)
    FROM Cotizacion c
    WHERE c.estado = 'CONVERTIDA'
      AND c.fecha BETWEEN :inicio AND :fin
""")
Long totalConvertidasPeriodo(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
);

@Query("""
    SELECT COUNT(c)
    FROM Cotizacion c
    WHERE c.estado = 'CANCELADA'
      AND c.fecha BETWEEN :inicio AND :fin
""")
Long totalCanceladasPeriodo(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
);

}
