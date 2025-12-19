package com.pv.pv.dto;

import java.util.List;

public class PedidoRequest {

    private Integer clienteId;
    private String estado;
    private String direccion;
    private List<Detalle> detalles;

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public List<Detalle> getDetalles() { return detalles; }
    public void setDetalles(List<Detalle> detalles) { this.detalles = detalles; }

    public static class Detalle {
        private Integer productoId;
        private Integer cantidad;

        public Integer getProductoId() { return productoId; }
        public void setProductoId(Integer productoId) { this.productoId = productoId; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}
