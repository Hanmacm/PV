package com.pv.pv.controller;

import com.pv.pv.model.Factura;
import com.pv.pv.model.Venta;
import com.pv.pv.model.VentaDetalle;
import com.pv.pv.repository.FacturaRepository;
import com.pv.pv.repository.VentaRepository;

import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;

@RestController
@RequestMapping("/facturas")
public class FacturaPDFController {

    private final FacturaRepository fRepo;
    private final VentaRepository vRepo;

    public FacturaPDFController(FacturaRepository fRepo, VentaRepository vRepo) {
        this.fRepo = fRepo;
        this.vRepo = vRepo;
    }

    @GetMapping("/pdf/{id}")
    public ResponseEntity<byte[]> pdf(@PathVariable Integer id) throws Exception {

        Factura f = fRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada"));

        Venta v = vRepo.findById(f.getVentaId())
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (PDDocument doc = new PDDocument()) {

            PDPage pg = new PDPage(PDRectangle.LETTER);
            doc.addPage(pg);

            PDPageContentStream cs = new PDPageContentStream(doc, pg);

            int y = 750;

            cs.setFont(PDType1Font.HELVETICA_BOLD, 20);
            cs.beginText();
            cs.newLineAtOffset(30, y);
            cs.showText("FACTURA #" + f.getId());
            cs.endText();

            y -= 40;

            cs.setFont(PDType1Font.HELVETICA, 12);
            cs.beginText();
            cs.newLineAtOffset(30, y);
            cs.showText("Cliente: " + f.getCliente());
            cs.endText();

            y -= 15;

            cs.beginText();
            cs.newLineAtOffset(30, y);
            cs.showText("RFC: " + f.getRfc());
            cs.endText();

            y -= 30;

            for (VentaDetalle d : v.getDetalles()) {
                cs.beginText();
                cs.newLineAtOffset(30, y);
                cs.showText("Prod #" + d.getProductoId() +
                        " x" + d.getCantidad() +
                        " $" + d.getSubtotal());
                cs.endText();
                y -= 15;
            }

            y -= 20;

            cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
            cs.beginText();
            cs.newLineAtOffset(30, y);
            cs.showText("TOTAL: $" + f.getTotal());
            cs.endText();

            cs.close();
            doc.save(out);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=factura_" + id + ".pdf"
                )
                .body(out.toByteArray());
    }
}
