package com.pv.pv.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cotizaciones")
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Cliente cliente;

    @Column(name = "cliente_id")
    private Integer clienteId;

    private LocalDateTime fecha;

    @Column(name = "fecha_vigencia")
    private LocalDate vigencia; 

    private Double total;
    private String estado;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @OneToMany(mappedBy = "cotizacion",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<CotizacionDetalle> detalles;

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
        if (this.estado == null) {
    this.estado = "ACTIVA";
}

    }


    public Integer getId() { return id; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public LocalDate getVigencia() { return vigencia; }
    public void setVigencia(LocalDate vigencia) { this.vigencia = vigencia; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public List<CotizacionDetalle> getDetalles() { return detalles; }
    public void setDetalles(List<CotizacionDetalle> detalles) { this.detalles = detalles; }
}
