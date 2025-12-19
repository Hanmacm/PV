package com.pv.pv.dto.consultas;

import com.pv.pv.model.*;
import lombok.Data;
import java.util.List;

@Data
public class ConsultasResponseDTO {
    private List<Producto> productos;
    private List<Cliente> clientes;
    private List<Proveedor> proveedores;
    private List<Venta> ventas;
    private List<Cotizacion> cotizaciones;
    private List<Compra> compras;
    private List<Pedido> pedidos;
}
