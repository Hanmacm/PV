package com.pv.pv.dto;

import java.util.List;

public class CotizacionRequest {

    private Integer clienteId;
    private Integer diasVigencia;   // número de días para calcular fecha límite
    private String notas;
    private List<DetalleRequest> detalles;

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public Integer getDiasVigencia() { return diasVigencia; }
    public void setDiasVigencia(Integer diasVigencia) { this.diasVigencia = diasVigencia; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public List<DetalleRequest> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleRequest> detalles) { this.detalles = detalles; }

    // ==========================================
    //  DETALLE
    // ==========================================
    public static class DetalleRequest {

        private Integer productoId;
        private Integer cantidad;
        private Double precio;

        public Integer getProductoId() { return productoId; }
        public void setProductoId(Integer productoId) { this.productoId = productoId; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

        public Double getPrecio() { return precio; }
        public void setPrecio(Double precio) { this.precio = precio; }
    }
}
