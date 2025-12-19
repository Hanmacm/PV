package com.pv.pv.service.impl;

import com.pv.pv.dto.ClienteReporteDTO;
import com.pv.pv.model.Cliente;
import com.pv.pv.repository.ClienteRepository;
import com.pv.pv.service.ClienteService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository repo;

    public ClienteServiceImpl(ClienteRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Cliente> listar() {
        return repo.findAll();
    }

    @Override
    public Cliente guardar(Cliente c) {

        if (c.getNombre() == null || c.getNombre().trim().length() < 2) {
            throw new RuntimeException("Nombre inválido");
        }

        if (c.getCorreo() != null && !c.getCorreo().isBlank()) {
            if (!c.getCorreo().contains("@")) {
                throw new RuntimeException("Correo incorrecto");
            }
        }

        return repo.save(c);
    }

    @Override
    public Cliente buscarPorId(Integer id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Cliente> listarActivos() {
        return repo.listarActivos();
    }

    @Override
    public void cambiarEstado(Integer id) {

        Cliente cli = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe"));

        String est = cli.getEstado().equals("ACTIVO") ? "INACTIVO" : "ACTIVO";

        repo.cambiarEstado(id, est);
    }

    @Override
    public List<Cliente> buscarFiltrado(String texto, String estado) {

        String tx = (texto == null || texto.isBlank()) ? null : texto.toLowerCase();
        String es = (estado == null || estado.isBlank()) ? null : estado;

        return repo.buscarFiltrado(tx, es);
    }

    @Override
    public ClienteReporteDTO reporteClientes() {
        return new ClienteReporteDTO(
                repo.totalClientes(),
                repo.clientesActivos(),
                repo.clientesInactivos(),
                repo.clientesMes()
        );
    }
}
