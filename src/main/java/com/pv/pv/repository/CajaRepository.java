package com.pv.pv.repository;

import com.pv.pv.model.Caja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CajaRepository extends JpaRepository<Caja, Integer> {

    Optional<Caja> findByEstado(String estado);

    @Query("SELECT COUNT(c) FROM Caja c")
    Long totalCajas();

    @Query("SELECT COUNT(c) FROM Caja c WHERE c.estado = 'Abierta'")
    Long cajasAbiertas();

    @Query("SELECT COUNT(c) FROM Caja c WHERE c.estado = 'Cerrada'")
    Long cajasCerradas();

    @Query("""
        SELECT c FROM Caja c
        WHERE c.estado = 'Abierta'
        ORDER BY c.fechaInicio DESC
    """)
    List<Caja> ultimaCajaAbierta();

    @Query("""
        SELECT c FROM Caja c
        WHERE c.estado = 'Cerrada'
        ORDER BY c.fechaCierre DESC
    """)
    List<Caja> ultimaCajaCerrada();
}
