package com.pv.pv.service;

import com.pv.pv.model.Producto;
import com.pv.pv.dto.ProductoInventarioDTO;
import com.pv.pv.dto.ProductoReporteDTO;
import java.util.List;

public interface ProductoService {

    List<Producto> listar();
    Producto guardar(Producto p);
    Producto buscar(Integer id);
    void eliminar(Integer id);

    List<Producto> listarActivos();
    void cambiarEstado(Integer id);
    List<Producto> buscarFiltrado(String texto, String estado);

    List<ProductoInventarioDTO> inventarioBajo();
    ProductoReporteDTO reporteProductos();
}
