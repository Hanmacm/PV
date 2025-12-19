package com.pv.pv.service;

import com.pv.pv.model.Proveedor;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ProveedorService {

    List<Proveedor> listar();

    Proveedor guardar(Proveedor p);

    Proveedor actualizar(Integer id, Proveedor p);

    void desactivar(Integer id);

    void activar(Integer id);

    List<Proveedor> buscar(String texto, Integer estado);

    ResponseEntity<byte[]> reporteExcel();
}
