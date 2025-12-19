package com.pv.pv.service.impl;

import com.pv.pv.model.Proveedor;
import com.pv.pv.repository.CompraRepository;
import com.pv.pv.repository.ProveedorRepository;
import com.pv.pv.service.ProveedorService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository provRepo;
    private final CompraRepository compRepo;

    public ProveedorServiceImpl(ProveedorRepository provRepo, CompraRepository compRepo) {
        this.provRepo = provRepo;
        this.compRepo = compRepo;
    }

    @Override
    public List<Proveedor> listar() {
        return provRepo.findAll();
    }

    @Override
    public Proveedor guardar(Proveedor p) {

        if (p.getNombre() == null || p.getNombre().isBlank()) {
            throw new RuntimeException("El nombre del proveedor es obligatorio");
        }

        if (provRepo.existsByNombreAndEmpresa(p.getNombre(), p.getEmpresa())) {
            throw new RuntimeException("El proveedor ya existe");
        }

        p.setActivo(1);
        return provRepo.save(p);
    }

    @Override
    public Proveedor actualizar(Integer id, Proveedor p) {

        Proveedor cur = provRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        cur.setTelefono(p.getTelefono());
        cur.setCorreo(p.getCorreo());
        cur.setDireccion(p.getDireccion());

        return provRepo.save(cur);
    }

    @Override
    public void desactivar(Integer id) {

        Proveedor p = provRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        if (compRepo.existsByProveedorId(id)) {
            throw new RuntimeException("No se puede desactivar el proveedor porque tiene compras registradas");
        }

        p.setActivo(0);
        provRepo.save(p);
    }

    @Override
    public void activar(Integer id) {

        Proveedor p = provRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        p.setActivo(1);
        provRepo.save(p);
    }

    @Override
    public List<Proveedor> buscar(String txt, Integer est) {

        boolean t0 = (txt == null || txt.isBlank());
        boolean e0 = (est == null);

        if (t0 && e0) return provRepo.findAll();

        String t = t0 ? null : txt;
        return provRepo.buscarFiltrado(t, est);
    }

    @Override
    public ResponseEntity<byte[]> reporteExcel() {

        try (Workbook wb = new XSSFWorkbook()) {

            Sheet sh = wb.createSheet("Proveedores");

            Row head = sh.createRow(0);
            String[] c = {"Nombre", "Empresa", "Teléfono", "Correo", "Estado"};
            for (int i = 0; i < c.length; i++) head.createCell(i).setCellValue(c[i]);

            List<Proveedor> lst = provRepo.findAll();

            int k = 1;
            for (Proveedor p : lst) {
                Row r = sh.createRow(k++);
                r.createCell(0).setCellValue(p.getNombre());
                r.createCell(1).setCellValue(p.getEmpresa() != null ? p.getEmpresa() : "");
                r.createCell(2).setCellValue(p.getTelefono() != null ? p.getTelefono() : "");
                r.createCell(3).setCellValue(p.getCorreo() != null ? p.getCorreo() : "");
                r.createCell(4).setCellValue(p.getActivo() == 1 ? "Activo" : "Inactivo");
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=proveedores.xlsx")
                    .body(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Error generando reporte");
        }
    }
}
