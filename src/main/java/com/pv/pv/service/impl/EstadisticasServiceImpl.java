package com.pv.pv.service.impl;

import com.pv.pv.dto.estadisticas.*;
import com.pv.pv.model.Compra;
import com.pv.pv.model.Venta;
import com.pv.pv.repository.CompraRepository;
import com.pv.pv.repository.VentaRepository;
import com.pv.pv.service.EstadisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EstadisticasServiceImpl implements EstadisticasService {

    private final VentaRepository vRepo;
    private final CompraRepository cRepo;

    @Override
    public TotalesDTO obtenerTotales() {

        List<Venta> vs = vRepo.findAll();
        List<Compra> cs = cRepo.findAll();

        double vTot = vs.stream().mapToDouble(Venta::getTotal).sum();
        double cTot = cs.stream().mapToDouble(Compra::getTotal).sum();

        return new TotalesDTO(vTot, cTot, vTot - cTot);
    }

    @Override
    public EstadisticaMensualDTO obtenerMensual() {

        EstadisticaMensualDTO d = new EstadisticaMensualDTO();

        List<Venta> vs = vRepo.findAll();
        List<Compra> cs = cRepo.findAll();

        vs.forEach(v -> {
            int m = v.getFecha().getMonthValue() - 1;
            d.getVm()[m] += v.getTotal();
        });

        cs.forEach(c -> {
            int m = c.getFecha().getMonthValue() - 1;
            d.getCm()[m] += c.getTotal();
        });

        for (int i = 0; i < 12; i++) {
            d.getGm()[i] = d.getVm()[i] - d.getCm()[i];
        }

        return d;
    }

    @Override
    public TopProductosDTO obtenerTopProductos() {

        var lst = vRepo.topProductos();

        return new TopProductosDTO(
                lst.stream().map(p -> p.getNombre()).toList(),
                lst.stream().map(p -> p.getCantidad()).toList()
        );
    }
}
