package com.pv.pv.service.impl;

import com.pv.pv.dto.*;
import com.pv.pv.model.Caja;
import com.pv.pv.repository.*;
import com.pv.pv.service.InicioService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class InicioServiceImpl implements InicioService {

    private final VentaRepository vRepo;
    private final ProductoRepository pRepo;
    private final CajaRepository cRepo;

    public InicioServiceImpl(VentaRepository vRepo,
                             ProductoRepository pRepo,
                             CajaRepository cRepo) {
        this.vRepo = vRepo;
        this.pRepo = pRepo;
        this.cRepo = cRepo;
    }

    @Override
    public InicioDashboardDTO cargarDashboard(String f) {

        LocalDateTime ini;
        LocalDateTime fin = LocalDateTime.now();

        if ("semana".equals(f)) {
            ini = LocalDate.now().with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        } else if ("mes".equals(f)) {
            ini = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        } else {
            ini = LocalDate.now().atStartOfDay();
        }

        InicioDashboardDTO d = new InicioDashboardDTO();

        double total = vRepo.totalPeriodo(ini, fin);
        int cnt = vRepo.countPeriodo(ini, fin);
        double prom = cnt > 0 ? total / cnt : 0;

        d.setVentasDia(total);
        d.setTicketsDia(cnt);
        d.setTicketPromedio(prom);

        d.setUltimasVentas(vRepo.ultimasVentas());
        d.setVentasPorMetodo(vRepo.ventasPorMetodo());
        d.setTopProductos(vRepo.topProductos());
        d.setProductosBajoInventario(pRepo.inventarioBajo());

        Optional<Caja> cx = cRepo.findByEstado("Abierta");
        cx.ifPresent(c ->
            d.setCajaActual(new CajaDTO(c.getId(), c.getMontoInicial()))
        );

        return d;
    }
}
