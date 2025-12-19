package com.pv.pv.repository;

import com.pv.pv.model.CajaMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CajaMovimientoRepository extends JpaRepository<CajaMovimiento, Integer> {

    List<CajaMovimiento> findByCajaId(Integer cajaId);

    @Query("""
        SELECT COALESCE(SUM(m.monto),0)
        FROM CajaMovimiento m
        WHERE m.tipo = 'Entrada'
    """)
    Double totalEntradas();

    @Query("""
        SELECT COALESCE(SUM(m.monto),0)
        FROM CajaMovimiento m
        WHERE m.tipo = 'Salida'
    """)
    Double totalSalidas();
}
