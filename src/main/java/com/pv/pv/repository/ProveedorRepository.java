package com.pv.pv.repository;

import com.pv.pv.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    boolean existsByNombreAndEmpresa(String nombre, String empresa);

    List<Proveedor> findByActivo(Integer activo);

    @Query("""
        SELECT p FROM Proveedor p
        WHERE p.activo = 1
        AND (
            LOWER(p.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))
         OR LOWER(COALESCE(p.empresa, '')) LIKE LOWER(CONCAT('%', :texto, '%'))
         OR LOWER(COALESCE(p.telefono, '')) LIKE LOWER(CONCAT('%', :texto, '%'))
         OR LOWER(COALESCE(p.correo, '')) LIKE LOWER(CONCAT('%', :texto, '%'))
        )
    """)
    List<Proveedor> buscarPorTexto(@Param("texto") String texto);

    @Query("""
        SELECT p FROM Proveedor p
        WHERE (:estado IS NULL OR p.activo = :estado)
          AND (
               :texto IS NULL
            OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))
            OR LOWER(COALESCE(p.empresa, '')) LIKE LOWER(CONCAT('%', :texto, '%'))
            OR LOWER(COALESCE(p.correo, '')) LIKE LOWER(CONCAT('%', :texto, '%'))
          )
    """)
    List<Proveedor> buscarFiltrado(
            @Param("texto") String texto,
            @Param("estado") Integer estado
    );
}
