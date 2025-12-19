package com.pv.pv.service;

import com.pv.pv.dto.ClienteReporteDTO;
import com.pv.pv.model.Cliente;
import java.util.List;

public interface ClienteService {

    List<Cliente> listar();

    Cliente guardar(Cliente c);

    Cliente buscarPorId(Integer id);

    List<Cliente> listarActivos();

    void cambiarEstado(Integer id);

    List<Cliente> buscarFiltrado(String t, String e);

    ClienteReporteDTO reporteClientes();
}
