package com.pv.pv.controller;

import com.pv.pv.dto.CajaReporteDTO;
import com.pv.pv.model.Caja;
import com.pv.pv.model.CajaMovimiento;
import com.pv.pv.service.CajaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cajas")
@CrossOrigin(origins = "*")
public class CajaController {

    private final CajaService cSrv;

    public CajaController(CajaService cSrv) {
        this.cSrv = cSrv;
    }

    @PostMapping("/abrir")
    public ResponseEntity<Caja> abrir(@RequestParam Double monto,
                                      @RequestParam Integer usuario) {
        return ResponseEntity.ok(cSrv.abrirCaja(monto, usuario));
    }

    @PostMapping("/cerrar")
    public ResponseEntity<Caja> cerrar() {
        return ResponseEntity.ok(cSrv.cerrarCaja());
    }

    @PostMapping("/movimiento")
    public ResponseEntity<CajaMovimiento> mover(@RequestParam String tipo,
                                                @RequestParam Double monto,
                                                @RequestParam String concepto) {
        return ResponseEntity.ok(cSrv.registrarMovimiento(tipo, monto, concepto));
    }

    @GetMapping("/actual")
    public ResponseEntity<Caja> actual() {
        return ResponseEntity.ok(cSrv.obtenerCajaActual());
    }

    @GetMapping("/historial")
    public ResponseEntity<List<Caja>> historial() {
        return ResponseEntity.ok(cSrv.historial());
    }

    @GetMapping("/{id}/movimientos")
    public ResponseEntity<List<CajaMovimiento>> movimientos(@PathVariable Integer id) {
        return ResponseEntity.ok(cSrv.movimientosPorCaja(id));
    }

    @GetMapping("/reporte")
    public ResponseEntity<CajaReporteDTO> reporte() {
        return ResponseEntity.ok(cSrv.reporteCajas());
    }
}
