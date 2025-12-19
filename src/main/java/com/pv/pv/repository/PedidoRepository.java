package com.pv.pv.repository;

import com.pv.pv.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    @Query("""
        SELECT p FROM Pedido p
        WHERE LOWER(COALESCE(p.estado, '')) LIKE %:texto%
           OR LOWER(p.cliente.nombre) LIKE %:texto%
    """)
    List<Pedido> buscarPorTexto(String texto);
    @Query("""
    SELECT COALESCE(SUM(p.total),0)
    FROM Pedido p
    WHERE p.fecha BETWEEN :ini AND :fin
""")
Double totalPeriodo(LocalDateTime ini, LocalDateTime fin);

@Query("""
    SELECT COUNT(p)
    FROM Pedido p
    WHERE p.fecha BETWEEN :ini AND :fin
""")
Long countPeriodo(LocalDateTime ini, LocalDateTime fin);

@Query("""
    SELECT COUNT(p)
    FROM Pedido p
    WHERE p.estado = 'Cancelado'
      AND p.fecha BETWEEN :ini AND :fin
""")
Long canceladosPeriodo(LocalDateTime ini, LocalDateTime fin);
@Query("""
    SELECT p FROM Pedido p
    WHERE DATE(p.fecha) = CURRENT_DATE
    ORDER BY p.fecha DESC
""")
List<Pedido> pedidosHoy();

@Query("""
    SELECT p FROM Pedido p
    WHERE p.fecha BETWEEN :inicio AND :fin
    ORDER BY p.fecha DESC
""")
List<Pedido> pedidosPorRango(
    @Param("inicio") LocalDateTime inicio,
    @Param("fin") LocalDateTime fin
);


}
