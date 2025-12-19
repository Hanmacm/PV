package com.pv.pv.controller;

import com.pv.pv.service.VentaTicketService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin("*")
public class TicketController {

    private final VentaTicketService ticketService;

    public TicketController(VentaTicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/ticket/{id}")
    public ResponseEntity<byte[]> generarTicket(@PathVariable Integer id) {

        byte[] pdf = ticketService.generarTicket(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set("Content-Disposition", "inline; filename=ticket_" + id + ".pdf");

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
