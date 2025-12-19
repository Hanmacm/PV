package com.pv.pv.repository;

import com.pv.pv.model.Cliente;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    @Query("""
        SELECT c FROM Cliente c
        WHERE LOWER(c.nombre) LIKE %:texto%
           OR LOWER(COALESCE(c.telefono, '')) LIKE %:texto%
           OR LOWER(COALESCE(c.correo, '')) LIKE %:texto%
    """)
    List<Cliente> buscarPorTexto(String texto);
    @Query("""
    SELECT c FROM Cliente c
    WHERE c.estado = 'ACTIVO'
    ORDER BY c.nombre
""")
List<Cliente> listarActivos();

@Modifying
@Transactional
@Query("""
    UPDATE Cliente c
    SET c.estado = :estado
    WHERE c.id = :id
""")
void cambiarEstado(Integer id, String estado);
@Query("""
    SELECT c FROM Cliente c
    WHERE
        (:texto IS NULL OR
         LOWER(c.nombre) LIKE %:texto% OR
         LOWER(COALESCE(c.telefono,'')) LIKE %:texto% OR
         LOWER(COALESCE(c.correo,'')) LIKE %:texto%)
    AND (:estado IS NULL OR c.estado = :estado)
    ORDER BY c.nombre
""")
List<Cliente> buscarFiltrado(String texto, String estado);
@Query("SELECT COUNT(c) FROM Cliente c")
Long totalClientes();

@Query("SELECT COUNT(c) FROM Cliente c WHERE c.estado = 'ACTIVO'")
Long clientesActivos();

@Query("SELECT COUNT(c) FROM Cliente c WHERE c.estado = 'INACTIVO'")
Long clientesInactivos();

@Query("""
    SELECT COUNT(c)
    FROM Cliente c
    WHERE c.fechaRegistro >= CURRENT_DATE
""")
Long clientesMes();

}
