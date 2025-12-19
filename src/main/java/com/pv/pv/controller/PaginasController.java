package com.pv.pv.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PaginasController {
    

    
    @GetMapping("/ventas")
public String ventas() {
    return "ventas";
}
@GetMapping("/cotizaciones")
public String cotizaciones() {
    return "cotizaciones";
}

    @GetMapping("/ordenes")
    public String ordenes() {
        return "ordenes";
    }

    @GetMapping("/pedidos")
    public String pedidos() {
        return "pedidos";
    }

    @GetMapping("/compras")
    public String compras() {
        return "compras";
    }

    @GetMapping("/productos")
    public String productos() {
        return "productos";
    }

    @GetMapping("/clientes")
    public String clientes() {
        return "clientes";
    }

    @GetMapping("/cajas")
    public String cajas() {
        return "cajas";
    }

    @GetMapping("/usuarios")
    public String usuarios() {
        return "usuarios";
    }

    @GetMapping("/proveedores")
    public String proveedores() {
        return "proveedores";
    }

    @GetMapping("/consultas")
    public String consultas() {
        return "consultas";
    }

    @GetMapping("/reportes")
    public String reportes() {
        return "reportes";
    }

    @GetMapping("/estadisticas")
    public String estadisticas() {
        return "estadisticas";
    }

    @GetMapping("/facturacion")
    public String facturacion() {
        return "facturacion";
    }

    @GetMapping("/configuraciones")
    public String configuraciones() {
        return "configuraciones";
    }

    @GetMapping("/tutoriales")
    public String tutoriales() {
        return "tutoriales";
    }
}
