package com.pv.pv.service.impl;

import com.pv.pv.model.Producto;
import com.pv.pv.repository.ProductoRepository;
import com.pv.pv.service.ProductoService;
import com.pv.pv.dto.ProductoInventarioDTO;
import com.pv.pv.dto.ProductoReporteDTO;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository repo;

    public ProductoServiceImpl(ProductoRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Producto> listar() {
        return repo.findAll();
    }

    @Override
    public Producto guardar(Producto p) {
        if (p.getEstado() == null || p.getEstado().isBlank()) {
            p.setEstado("ACTIVO");
        }
        return repo.save(p);
    }

    @Override
    public Producto buscar(Integer id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public void eliminar(Integer id) {
        repo.deleteById(id);
    }

    @Override
    public List<Producto> listarActivos() {
        return repo.listarActivos();
    }

    @Override
    public void cambiarEstado(Integer id) {
        Producto p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        String st = "ACTIVO".equals(p.getEstado()) ? "INACTIVO" : "ACTIVO";
        repo.cambiarEstado(id, st);
    }

    @Override
    public List<Producto> buscarFiltrado(String txt, String est) {
        String t = (txt == null || txt.isBlank()) ? null : txt.toLowerCase();
        String e = (est == null || est.isBlank()) ? null : est;
        return repo.buscarFiltrado(t, e);
    }

    @Override
    public List<ProductoInventarioDTO> inventarioBajo() {
        return repo.inventarioBajo();
    }

    @Override
    public ProductoReporteDTO reporteProductos() {
        return new ProductoReporteDTO(
                repo.totalProductos(),
                repo.productosActivos(),
                repo.productosInactivos(),
                repo.productosStockBajo(),
                repo.valorInventario()
        );
    }
}
