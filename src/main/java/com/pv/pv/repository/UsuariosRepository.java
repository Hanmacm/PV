package com.pv.pv.repository;

import com.pv.pv.model.Usuarios;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface UsuariosRepository extends JpaRepository<Usuarios, Integer> {

    boolean existsByUser(String user);

    Usuarios findByUser(String user);

    List<Usuarios> findByRol(String rol);

    @Query("""
        SELECT u FROM Usuarios u
        WHERE lower(u.user) LIKE lower(concat('%', :txt, '%'))
           OR lower(u.nombre) LIKE lower(concat('%', :txt, '%'))
           OR lower(u.correo) LIKE lower(concat('%', :txt, '%'))
    """)
    List<Usuarios> buscarTexto(@Param("txt") String txt);

    @Query("""
        SELECT u FROM Usuarios u
        WHERE u.rol = :rol
          AND (
               lower(u.user) LIKE lower(concat('%', :txt, '%'))
            OR lower(u.nombre) LIKE lower(concat('%', :txt, '%'))
            OR lower(u.correo) LIKE lower(concat('%', :txt, '%'))
          )
    """)
    List<Usuarios> buscarTextoYRol(
            @Param("txt") String txt,
            @Param("rol") String rol
    );
}
