package com.pv.pv.service.impl;

import com.pv.pv.dto.reportes.ReporteGeneralDTO;
import com.pv.pv.repository.ReportesRepository;
import com.pv.pv.service.ReportesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportesServiceImpl implements ReportesService {

    private final ReportesRepository repo;

    @Override
    public ReporteGeneralDTO generarReporte(String d, String h) {

        LocalDateTime ini = LocalDate.parse(d).atStartOfDay();
        LocalDateTime fin = LocalDate.parse(h).atTime(23,59,59);

        var vtas = repo.ventasPorFechas(ini, fin);
        var comps = repo.comprasPorFechas(ini, fin);
        var top = repo.topProductosPorFechas(ini, fin);

        ReporteGeneralDTO r = new ReporteGeneralDTO();

        double tv = vtas.stream().mapToDouble(x -> x.getTotal()).sum();
        double tc = comps.stream().mapToDouble(x -> x.getTotal()).sum();

        r.setTotalVentas(tv);
        r.setTotalCompras(tc);
        r.setGanancias(tv - tc);

        r.setCantidadVentas(vtas.size());
        r.setCantidadCompras(comps.size());

        r.setTicketPromedio(
                r.getCantidadVentas() == 0 ? 0 : tv / r.getCantidadVentas()
        );

        r.setVentas(vtas);
        r.setCompras(comps);

        r.setNombresProductos(top.stream().map(x -> x.getNombre()).toList());
        r.setCantidadesProductos(top.stream().map(x -> x.getCantidad()).toList());

        return r;
    }
}
