let pedLst = [];
let cliLst = [];
let prodLst = [];
let detLst = [];
let pedActual = null;
let pedVentaCarrito = [];
let pedComisionTarjetaPct = 3;
let pedImpuestoPct = 16;
document.getElementById("pedImpuestoInput")
  ?.addEventListener("input", e => {
    pedImpuestoPct = Number(e.target.value || 0);
    calcPedidoVenta();
  });


document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadCli();
        await loadProd();
        await loadPed();
    } catch (e) {
        alertaError("No se pudieron cargar los datos iniciales");
        console.error(e);
    }
});

async function loadCli() {
    const r = await fetch("/api/clientes");
    cliLst = (await r.json()).filter(x => x.estado === "ACTIVO");
    const s = document.getElementById("pedCliente");
    if (!s) return;
    s.innerHTML = "";
    cliLst.forEach(c => s.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
}

async function loadProd() {
    const r = await fetch("/api/productos/activos");
    prodLst = await r.json();
    const s = document.getElementById("pedProducto");
    if (!s) return;
    s.innerHTML = "";
    prodLst.forEach(p => s.innerHTML += `<option value="${p.id}">${p.nombre} - $${Number(p.precio).toFixed(2)}</option>`);
}

async function loadPed() {
    pedLst = await ajaxGET("/api/pedidos/listar");
    drawPed();
}

function cargarPedidos() {
    loadPed();
}

function abrirModalPedido() {
    detLst = [];
    const notas = document.getElementById("pedNotas");
    if (notas) notas.value = "";
    updDet();
    updTot();
    abrirModal("modalPedido");
}

function agregarProductoPedido() {
    const pedProducto = document.getElementById("pedProducto");
    const pedCantidad = document.getElementById("pedCantidad");

    const id = Number(pedProducto?.value || 0);
    const c  = Number(pedCantidad?.value || 0);

    if (!id || c <= 0)
        return alertaWarning("Selecciona un producto y una cantidad válida");

    const p = prodLst.find(x => x.id === id);
    if (!p) return alertaError("Producto no encontrado");

    const existente = detLst.find(d => d.productoId === id);

    if (existente) {

        existente.cantidad += c;
        existente.subtotal = existente.cantidad * existente.precio;
    } else {
        detLst.push({
            productoId: p.id,
            nombre: p.nombre,
            cantidad: c,
            precio: Number(p.precio || 0),
            subtotal: Number(p.precio || 0) * c
        });
    }

    updDet();
    updTot();

    pedCantidad.value = 1;
}


function eliminarItemDetalle(i) {
    detLst.splice(i, 1);
    updDet();
    updTot();
}

function updDet() {
    const tb = document.querySelector("#tablaDetallePedido tbody");
    if (!tb) return;

    tb.innerHTML = "";

    if (!detLst.length) {
        tb.innerHTML = `<tr><td colspan="5">Sin productos</td></tr>`;
        return;
    }

    detLst.forEach((d, i) => {
        tb.innerHTML += `
        <tr>
            <td>${d.nombre}</td>
            <td>${d.cantidad}</td>
            <td>$${Number(d.precio).toFixed(2)}</td>
            <td>$${Number(d.subtotal).toFixed(2)}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="eliminarItemDetalle(${i})">&times;</button>
            </td>
        </tr>`;
    });
}

function updTot() {
    const t = detLst.reduce((a, b) => a + Number(b.subtotal || 0), 0);
    const pedTotal = document.getElementById("pedTotal");
    if (pedTotal) pedTotal.textContent = t.toFixed(2);
    return t;
}

async function guardarPedido() {
    const editId = window._pedidoEditandoId || null;

    const pedCliente = document.getElementById("pedCliente");
    const pedEstado  = document.getElementById("pedEstado");
    const pedNotas   = document.getElementById("pedNotas");

    if (!pedCliente?.value)
        return alertaWarning("Selecciona un cliente");

    if (!detLst.length)
        return alertaWarning("Agrega al menos un producto");

    const payload = {
        clienteId: Number(pedCliente.value),
        estado: String(pedEstado?.value || "Pendiente"),
        direccion: String(pedNotas?.value || ""),
        detalles: detLst.map(d => ({
            productoId: d.productoId,
            cantidad: d.cantidad
        }))
    };

    try {

        const url    = editId
            ? `/api/pedidos/${editId}`     
            : `/api/pedidos/guardar`;     

        const method = editId ? "PUT" : "POST";

        const r = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!r.ok) {
            const errTxt = await safeReadError(r);
            return alertaError(errTxt || "No se pudo guardar el pedido");
        }

        cerrarModal("modalPedido");
        window._pedidoEditandoId = null;

        await loadPed();

        alertaExito(
            editId
                ? "Pedido actualizado correctamente"
                : "Pedido registrado correctamente"
        );

    } catch (e) {
        console.error(e);
        alertaError("No se pudo guardar el pedido");
    }
}

function drawPed() {
    const tb = document.querySelector("#tablaPedidos tbody");
    if (!tb) return;

    tb.innerHTML = "";

    if (!pedLst || !pedLst.length) {
        tb.innerHTML = `<tr><td colspan="7">No hay pedidos registrados</td></tr>`;
        return;
    }

    pedLst.forEach(p => {
        const est = String(p.estado || "");
        const estLow = est.toLowerCase();

        const bloqueado = (estLow === "cancelado" || estLow === "convertido");
        const titleConv = (estLow === "cancelado")
            ? "No se puede convertir un pedido cancelado"
            : (estLow === "convertido" ? "Este pedido ya fue convertido" : "");

        tb.innerHTML += `
        <tr data-id="${p.id}">
            <td>${p.id}</td>
            <td>${p.cliente?.nombre || "-"}</td>
            <td>${(p.fecha ? String(p.fecha).replace("T"," ").substring(0,16) : "")}</td>
            <td><span class="badge">${est || "-"}</span></td>
            <td>${p.direccionEntrega || ""}</td>
            <td>$${Number(p.total || 0).toFixed(2)}</td>
            <td>
                <button class="btn btn-success btn-sm"
                    ${bloqueado ? "disabled" : ""}
                    title="${bloqueado ? titleConv : "Convertir a venta"}"
                    onclick="convertirPedido(${p.id})">
                    <i class="bi bi-arrow-left-right"></i>
                </button>

                <button class="btn btn-info btn-sm" onclick="verDetallePedido(${p.id})">
                    <i class="bi bi-eye"></i>
                </button>

                <button class="btn btn-warning btn-sm"
                    onclick="editarPedido(${p.id})"
                    ${["cancelado","convertido"].includes(String(p.estado).toLowerCase()) ? "disabled" : ""}>
                    <i class="bi bi-pencil"></i>
                </button>

                <button class="btn btn-danger btn-sm"
    ${(estLow === "cancelado" || estLow === "convertido") ? "disabled" : ""}
    title="${estLow === "convertido" ? "Un pedido convertido no se puede cancelar" : "Cancelar pedido"}"
    onclick="cancelarPedido(${p.id})">
    <i class="bi bi-x-circle"></i>
</button>

            </td>
        </tr>`;
    });
    resaltarDesdeConsulta();

}

async function verDetallePedido(id) {
    try {
        const p = pedLst.find(x => x.id === id);
        if (!p) return alertaError("Pedido no encontrado");

        const det = await ajaxGET(`/api/pedidos/${id}/detalle`);

        const info = document.getElementById("detallePedidoInfo");
        if (info) {
            info.innerHTML = `
                <b>Pedido #:</b> ${p.id}<br>
                <b>Cliente:</b> ${p.cliente?.nombre || "-"}<br>
                <b>Fecha:</b> ${(p.fecha ? String(p.fecha).replace("T"," ").substring(0,16) : "-")}<br>
                <b>Estado:</b> ${p.estado || "-"}<br>
                <b>Dirección:</b> ${p.direccionEntrega || ""}
            `;
        }

        const tb = document.getElementById("detallePedidoTabla");
        if (!tb) return abrirModal("modalDetallePedido");

        tb.innerHTML = "";

        if (!det || !det.length) {
            tb.innerHTML = `<tr><td colspan="4">Sin productos</td></tr>`;
        } else {
            det.forEach(d => {
                tb.innerHTML += `
                    <tr>
                        <td>${d.producto?.nombre || "Producto"}</td>
                        <td>${Number(d.cantidad || 0)}</td>
                        <td>$${Number(d.precio || 0).toFixed(2)}</td>
                        <td>$${Number(d.subtotal || 0).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        abrirModal("modalDetallePedido");

    } catch (e) {
        console.error(e);
        alertaError("No se pudo cargar el detalle del pedido");
    }
}

async function convertirPedido(id) {
    const p = pedLst.find(x => x.id === id);
    if (!p) return alertaError("Pedido no encontrado");

    const est = String(p.estado).toLowerCase();
    if (est === "cancelado" || est === "convertido")
        return alertaWarning("Este pedido no se puede convertir");

    try {
        pedActual = p;
        pedVentaCarrito = [];

        document.getElementById("pedVentaCliente").textContent =
            "Cliente: " + (p.cliente?.nombre || "");

        const det = await ajaxGET(`/api/pedidos/${id}/detalle`);

        det.forEach(d => {
            pedVentaCarrito.push({
                productoId: d.producto.id,
                nombre: d.producto.nombre,
                cantidad: d.cantidad,
                precio: d.precio,
                subtotal: d.subtotal
            });
        });

        limpiarPagoPedido();
        pintarPedidoVentaCarrito();
        calcPedidoVenta();

        abrirModal("modalConvertirPedido");

    } catch (e) {
        console.error(e);
        alertaError("No se pudo preparar el pedido");
    }
}

function pintarPedidoVentaCarrito() {
    const tb = document.querySelector("#tablaPedVentaCarrito tbody");
    tb.innerHTML = "";
    pedVentaCarrito.forEach(p => {
        tb.innerHTML += `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.cantidad}</td>
            <td>$${p.precio.toFixed(2)}</td>
            <td>$${p.subtotal.toFixed(2)}</td>
        </tr>`;
    });
}

function limpiarPagoPedido() {
    ["pedPagaCon","pedMixtoEfectivo","pedMixtoTarjeta","pedMixtoTransferencia"]
      .forEach(id => document.getElementById(id).value = "");
}

function calcPedidoVenta() {

    const metodo = document.querySelector("input[name='pedMetodoPago']:checked")?.value || "efectivo";

    const bEf = document.getElementById("pedPagoEfectivo");
    const bMx = document.getElementById("pedPagoMixto");
    const bCo = document.getElementById("pedBloqueComisionTarjeta");

    if (bEf) bEf.style.display = "none";
    if (bMx) bMx.style.display = "none";
    if (bCo) bCo.style.display = "none";

    if (metodo === "efectivo" && bEf) bEf.style.display = "block";
    if (metodo === "mixto" && bMx) bMx.style.display = "block";
    if (metodo === "tarjeta" || metodo === "mixto") {
        if (bCo) bCo.style.display = "block";
    }

    const sub = pedVentaCarrito.reduce((s,x)=>s + Number(x.subtotal||0),0);
    const iva = sub * (pedImpuestoPct / 100);

    const pct = Number(pedComisionTarjetaPct || 0) / 100;

    let com = 0;
    let pagado = 0;

    if (metodo === "efectivo") {
        pagado = Number(document.getElementById("pedPagaCon")?.value || 0);
    }

    if (metodo === "tarjeta") {
        com = sub * pct;
        pagado = sub + iva + com;
    }

    if (metodo === "transferencia") {
        pagado = sub + iva;
    }

    if (metodo === "mixto") {
        const ef = Number(document.getElementById("pedMixtoEfectivo")?.value || 0);
        const tj = Number(document.getElementById("pedMixtoTarjeta")?.value || 0);
        const tr = Number(document.getElementById("pedMixtoTransferencia")?.value || 0);

        pagado = ef + tj + tr;
        com = tj * pct;
    }

    const total = sub + iva + com;
    const cambio = pagado > total ? pagado - total : 0;
    const falta  = pagado < total ? total - pagado : 0;

    document.getElementById("pedVentaSubtotal").textContent = "$" + sub.toFixed(2);
    document.getElementById("pedVentaIVA").textContent = "$" + iva.toFixed(2);
    document.getElementById("pedVentaTotal").textContent = "$" + total.toFixed(2);

    document.getElementById("pedPagado").textContent = "$" + pagado.toFixed(2);
    document.getElementById("pedCambio").textContent  = "$" + cambio.toFixed(2);
    document.getElementById("pedFalta").textContent   = "$" + falta.toFixed(2);

    const btn = document.querySelector("#modalConvertirPedido .btn-cobrar");
    if (btn) btn.disabled = falta > 0;
}

document.querySelectorAll("input[name='pedMetodoPago']")
  .forEach(r => r.addEventListener("change", calcPedidoVenta));

["pedPagaCon","pedMixtoEfectivo","pedMixtoTarjeta","pedMixtoTransferencia"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calcPedidoVenta);
  });

document.getElementById("pedComisionTarjetaInput")
  ?.addEventListener("input", e => {
    pedComisionTarjetaPct = Number(e.target.value || 0);
    calcPedidoVenta();
  });

async function confirmarConvertirPedido() {

    if (!pedActual) return alertaError("Pedido inválido");

    const metodo = document.querySelector("input[name='pedMetodoPago']:checked").value;
    const total  = Number(
        document.getElementById("pedVentaTotal").textContent.replace(/[$,]/g,"")
    );

    let pagos = null;
    if (metodo === "mixto") {
        pagos = {
            efectivo: Number(pedMixtoEfectivo.value||0),
            tarjeta: Number(pedMixtoTarjeta.value||0),
            transferencia: Number(pedMixtoTransferencia.value||0)
        };
    }

    const body = {
        clienteId: pedActual.cliente.id,
        usuarioId: 1,
        metodoPago: metodo,
        total,
        comisionTarjetaPct: pedComisionTarjetaPct,
        pagos,
        detalles: pedVentaCarrito.map(d => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precio: d.precio,
            subtotal: d.subtotal
        }))
    };

    try {
        const r = await fetch("/api/ventas/guardar", {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(body)
        });

        if (!r.ok)
            return alertaWarning("No hay caja abierta");

        await fetch(`/api/pedidos/estado/${pedActual.id}?estado=Convertido`,{method:"PUT"});

        cerrarModal("modalConvertirPedido");
        alertaExito("Pedido convertido a venta");
        await loadPed();

    } catch (e) {
        console.error(e);
        alertaError("Error al convertir pedido");
    }
}

async function cancelarPedido(id) {
    const p = pedLst.find(x => x.id === id);
    if (!p) return alertaError("Pedido no encontrado");

   const estLow = String(p.estado || "").toLowerCase();

if (estLow === "cancelado") {
    return alertaInfo("Este pedido ya está cancelado");
}

if (estLow === "convertido") {
    return alertaWarning("Un pedido convertido no se puede cancelar");
}

    alertaConfirmacion(
        "Cancelar pedido",
        "¿Deseas cancelar este pedido?",
        async () => {
            try {
                const r = await fetch(`/api/pedidos/estado/${id}?estado=Cancelado`, { method: "PUT" });
                if (!r.ok) {
                    const errTxt = await safeReadError(r);
                    return alertaError(errTxt || "No se pudo cancelar el pedido");
                }

                alertaWarning("Pedido cancelado");
                await loadPed();

            } catch (e) {
                console.error(e);
                alertaError("No se pudo cancelar el pedido");
            }
        }
    );
}

function abrirModalReportesPedidos() {
    const repPedTotal = document.getElementById("repPedTotal");
    const repPedCantidad = document.getElementById("repPedCantidad");
    const repPedCancelados = document.getElementById("repPedCancelados");
    const repPedInicio = document.getElementById("repPedInicio");
    const repPedFin = document.getElementById("repPedFin");

    if (repPedTotal) repPedTotal.textContent = "$0.00";
    if (repPedCantidad) repPedCantidad.textContent = "0";
    if (repPedCancelados) repPedCancelados.textContent = "0";
    if (repPedInicio) repPedInicio.value = "";
    if (repPedFin) repPedFin.value = "";

    abrirModal("modalReportesPedidos");
}

async function cargarReportePedidosPeriodo() {
    const repPedInicio = document.getElementById("repPedInicio");
    const repPedFin = document.getElementById("repPedFin");

    const i = repPedInicio?.value;
    const f = repPedFin?.value;

    if (!i || !f) return alertaWarning("Selecciona un rango de fechas");

    try {
        const d = await ajaxGET(`/api/pedidos/reporte/periodo?inicio=${i}&fin=${f}`);

        const repPedTotal = document.getElementById("repPedTotal");
        const repPedCantidad = document.getElementById("repPedCantidad");
        const repPedCancelados = document.getElementById("repPedCancelados");

        if (repPedTotal) repPedTotal.textContent = `$${Number(d.total || 0).toFixed(2)}`;
        if (repPedCantidad) repPedCantidad.textContent = String(d.cantidad ?? 0);
        if (repPedCancelados) repPedCancelados.textContent = String(d.cancelados ?? 0);

    } catch (e) {
        console.error(e);
        alertaError("No se pudo generar el reporte");
    }
}

function abrirModalBuscarPedidos() {
    abrirModal("modalBuscarPedidos");
}

async function pedidosHoy() {
    try {
        pedLst = await ajaxGET("/api/pedidos/hoy");
        drawPed();
    } catch (e) {
        console.error(e);
        alertaError("No se pudieron cargar los pedidos de hoy");
    }
}

async function pedidosPorFecha() {
    const filtroFechaPedido = document.getElementById("filtroFechaPedido");
    const f = filtroFechaPedido?.value;

    if (!f) return alertaWarning("Selecciona una fecha");

    try {
        pedLst = await ajaxGET(`/api/pedidos/fecha?fecha=${f}`);
        drawPed();
    } catch (e) {
        console.error(e);
        alertaError("No se pudieron cargar los pedidos por fecha");
    }
}

function alerta(tipo, titulo, mensaje) {
    const box   = document.getElementById("alertBox");
    const icon  = document.getElementById("alertIcon");
    const title = document.getElementById("alertTitle");
    const msg   = document.getElementById("alertMessage");
    const btn   = document.getElementById("alertBtn");

    if (!box || !icon || !title || !msg || !btn) {

        return window.alert(`${titulo}\n${mensaje}`);
    }

    const icons = {
        info: "bi-info-circle",
        success: "bi-check-circle",
        error: "bi-x-circle",
        warning: "bi-exclamation-triangle"
    };

    box.className = `alert-box alert-${tipo}`;
    icon.innerHTML = `<i class="bi ${icons[tipo] || icons.info}"></i>`;
    title.textContent = titulo;
    msg.textContent = mensaje;

    btn.onclick = () => cerrarModal("modalAlertModern");

    abrirModal("modalAlertModern");
}

const alertaInfo    = m => alerta("info",    "Información", m);
const alertaExito   = m => alerta("success", "Éxito", m);
const alertaError   = m => alerta("error",   "Error", m);
const alertaWarning = m => alerta("warning", "Atención", m);

function alertaConfirmacion(titulo, mensaje, onAceptar) {
    alerta("warning", titulo, mensaje);

    const btn = document.getElementById("alertBtn");
    if (!btn) return;

    btn.onclick = () => {
        cerrarModal("modalAlertModern");
        if (typeof onAceptar === "function") onAceptar();
    };
}

async function safeReadError(resp) {
    try {
        const ct = resp.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            const j = await resp.json();
            return j.message || j.error || JSON.stringify(j);
        }
        return (await resp.text()) || "";
    } catch {
        return "";
    }
}
async function editarPedido(id) {

    const p = pedLst.find(x => x.id === id);
    if (!p) return alertaError("Pedido no encontrado");

    const est = String(p.estado).toLowerCase();
    if (est === "cancelado" || est === "convertido") {
        return alertaWarning("Este pedido no se puede editar");
    }

    try {
        const det = await ajaxGET(`/api/pedidos/${id}/detalle`);

        pedCliente.value = p.cliente.id;
        pedEstado.value  = p.estado;
        pedNotas.value   = p.direccionEntrega || "";
        detLst = det.map(d => ({
            productoId: d.producto.id,
            nombre: d.producto.nombre,
            cantidad: d.cantidad,
            precio: d.precio,
            subtotal: d.subtotal
        }));

        updDet();
        updTot();

        window._pedidoEditandoId = id;

        abrirModal("modalPedido");

    } catch (e) {
        console.error(e);
        alertaError("No se pudo cargar el pedido para editar");
    }
}
function resaltarDesdeConsulta() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("resaltar");
    if (!id) return;

    setTimeout(() => {
        const fila = document.querySelector(
            `#tablaPedidos tbody tr[data-id="${id}"]`
        );

        if (fila) {
            fila.classList.add("resaltado");
            fila.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        history.replaceState({}, document.title, location.pathname);
    }, 100);
}

