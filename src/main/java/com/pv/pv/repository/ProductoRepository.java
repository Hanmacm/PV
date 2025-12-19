package com.pv.pv.repository;

import com.pv.pv.dto.ProductoInventarioDTO;
import com.pv.pv.model.Producto;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    @Query("""
        SELECT new com.pv.pv.dto.ProductoInventarioDTO(
            p.nombre,
            p.stock
        )
        FROM Producto p
        WHERE p.stock <= 5
        ORDER BY p.stock ASC
    """)
    List<ProductoInventarioDTO> inventarioBajo();

    // 🔍 NUEVO: búsqueda para consultas globales
    @Query("""
        SELECT p FROM Producto p
        WHERE LOWER(p.nombre) LIKE %:texto%
           OR LOWER(COALESCE(p.categoria, '')) LIKE %:texto%
           OR LOWER(COALESCE(p.codigo, '')) LIKE %:texto%
    """)
    List<Producto> buscarPorTexto(String texto);
    @Query("""
    SELECT p FROM Producto p
    WHERE p.estado = 'ACTIVO'
    ORDER BY p.nombre
""")
List<Producto> listarActivos();
@Modifying
@Transactional
@Query("""
    UPDATE Producto p
    SET p.estado = :estado
    WHERE p.id = :id
""")
void cambiarEstado(Integer id, String estado);
@Query("""
    SELECT p FROM Producto p
    WHERE
        (:texto IS NULL OR
         LOWER(p.nombre) LIKE %:texto% OR
         LOWER(COALESCE(p.categoria,'')) LIKE %:texto% OR
         LOWER(COALESCE(p.codigo,'')) LIKE %:texto%)
    AND (:estado IS NULL OR p.estado = :estado)
    ORDER BY p.nombre
""")
List<Producto> buscarFiltrado(String texto, String estado);
@Query("SELECT COUNT(p) FROM Producto p")
Long totalProductos();

@Query("SELECT COUNT(p) FROM Producto p WHERE p.estado = 'ACTIVO'")
Long productosActivos();

@Query("SELECT COUNT(p) FROM Producto p WHERE p.estado = 'INACTIVO'")
Long productosInactivos();

@Query("SELECT COUNT(p) FROM Producto p WHERE p.stock <= 5")
Long productosStockBajo();

@Query("""
    SELECT COALESCE(SUM(p.stock * p.precio), 0)
    FROM Producto p
    WHERE p.estado = 'ACTIVO'
""")
Double valorInventario();


}
