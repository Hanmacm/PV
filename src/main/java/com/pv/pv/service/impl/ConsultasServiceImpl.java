package com.pv.pv.service.impl;

import com.pv.pv.dto.consultas.ConsultasResponseDTO;
import com.pv.pv.repository.*;
import com.pv.pv.service.ConsultasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsultasServiceImpl implements ConsultasService {

    private final ProductoRepository prodRepo;
    private final ClienteRepository cliRepo;
    private final ProveedorRepository provRepo;
    private final VentaRepository vtaRepo;
    private final CotizacionRepository cotRepo;
    private final CompraRepository cmpRepo;
    private final PedidoRepository pedRepo;

    @Override
    public ConsultasResponseDTO buscarGlobal(String txt) {

        String q = txt == null ? "" : txt.trim().toLowerCase();

        ConsultasResponseDTO r = new ConsultasResponseDTO();

        r.setProductos(prodRepo.buscarPorTexto(q));
        r.setClientes(cliRepo.buscarPorTexto(q));
        r.setProveedores(provRepo.buscarPorTexto(q));
        r.setVentas(vtaRepo.buscarPorTexto(q));
        r.setCotizaciones(cotRepo.buscarPorTexto(q));
        r.setCompras(cmpRepo.buscarPorTexto(q));
        r.setPedidos(pedRepo.buscarPorTexto(q));

        return r;
    }
}
