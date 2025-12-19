package com.pv.pv.service.impl;

import com.pv.pv.model.Producto;
import com.pv.pv.model.Venta;
import com.pv.pv.model.VentaDetalle;
import com.pv.pv.repository.ProductoRepository;
import com.pv.pv.repository.VentaRepository;
import com.pv.pv.service.VentaTicketService;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class VentaTicketServiceImpl implements VentaTicketService {

    private final VentaRepository ventaRepo;
    private final ProductoRepository productoRepo;

    public VentaTicketServiceImpl(VentaRepository ventaRepo, ProductoRepository productoRepo) {
        this.ventaRepo = ventaRepo;
        this.productoRepo = productoRepo;
    }

    @Override
    public byte[] generarTicket(Integer ventaId) {

        Venta v = ventaRepo.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        try (PDDocument doc = new PDDocument()) {

           PDPage page = new PDPage(PDRectangle.A4);

            doc.addPage(page);

            PDPageContentStream cs = new PDPageContentStream(doc, page);

            int y = 380;

            cs.beginText();
            cs.setFont(PDType1Font.COURIER_BOLD, 12);
            cs.newLineAtOffset(20, y);
            cs.showText("LA CARPITA - TICKET DE VENTA");
            cs.endText();

            y -= 20;

            cs.beginText();
            cs.setFont(PDType1Font.COURIER, 10);
            cs.newLineAtOffset(20, y);
            cs.showText("Folio: " + v.getId());
            cs.endText();

            y -= 15;
            cs.beginText();
            cs.newLineAtOffset(20, y);
            cs.showText("Fecha: " + v.getFecha().toString().replace("T", " "));
            cs.endText();

            y -= 20;
            cs.beginText();
            cs.setFont(PDType1Font.COURIER_BOLD, 10);
            cs.newLineAtOffset(20, y);
            cs.showText("-----------------------------------");
            cs.endText();

            y -= 15;

            // DETALLES
            for (VentaDetalle d : v.getDetalles()) {

                Producto p = productoRepo.findById(d.getProductoId())
                        .orElse(null);

                String nombre = p != null ? p.getNombre() : "Prod " + d.getProductoId();

                cs.beginText();
                cs.setFont(PDType1Font.COURIER, 9);
                cs.newLineAtOffset(20, y);
                cs.showText(nombre);
                cs.endText();

                y -= 12;

                cs.beginText();
                cs.newLineAtOffset(20, y);
                cs.showText(d.getCantidad() + " x $" + d.getPrecio() + " = $" + d.getSubtotal());
                cs.endText();

                y -= 15;
            }

            y -= 10;
            cs.beginText();
            cs.setFont(PDType1Font.COURIER_BOLD, 10);
            cs.newLineAtOffset(20, y);
            cs.showText("-----------------------------------");
            cs.endText();

            y -= 20;
            cs.beginText();
            cs.setFont(PDType1Font.COURIER_BOLD, 12);
            cs.newLineAtOffset(20, y);
            cs.showText("TOTAL: $" + v.getTotal());
            cs.endText();

            cs.close();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF", e);
        }
    }
}
