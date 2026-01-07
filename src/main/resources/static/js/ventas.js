let crt = [];
let prd = [];
let cli = [];
let comisionTarjetaPct = 3;
let impuestoPct = 16;
document.getElementById("impuestoInput")
  ?.addEventListener("input", e => {
      impuestoPct = Number(e.target.value || 0);
      calc();
  });

document.addEventListener("DOMContentLoaded", async () => {

    await loadCaja();

    prd = (await ajaxGET("/api/productos")).filter(p => p.estado === "ACTIVO");
    cli = (await ajaxGET("/api/clientes")).filter(c => c.estado === "ACTIVO");

    llenarSelect("ventaProductoModal", prd, "nombre", "id");
    llenarSelect("ventaClienteModal", cli, "nombre", "id");

    btnVentaAgregarModal.onclick = addCrt;
    btnVentaCobrarModal.onclick  = saveVta;

    document.querySelectorAll("input[name='ventaMetodoModal']")
        .forEach(r => r.addEventListener("change", calc));

    ventaPagaConModal.addEventListener("input", calc);
["mixtoEfectivo","mixtoTarjeta","mixtoTransferencia"]
  .forEach(id => document.getElementById(id)?.addEventListener("input", calc));
document.getElementById("comisionTarjetaInput")
  ?.addEventListener("input", e => {
      comisionTarjetaPct = Number(e.target.value || 0);
      calc();
  });

    loadVtas();
});

async function loadCaja() {

    const c = await ajaxGET("/api/cajas/actual");

    const txt = (!c || c.estado !== "Abierta")
        ? "Sin caja abierta"
        : `Caja #${c.id} | ${c.fechaInicio.substring(0,16)}`;

    ventaCajaActual.textContent = txt;
    ventaCajaActualModal.textContent = txt;
}

function addCrt() {

    const id = Number(ventaProductoModal.value);
    const q  = Number(ventaCantidadModal.value);

    if (!id || q <= 0) return msg("Producto / cantidad inválidos");

    const p = prd.find(x => x.id === id);
    if (!p) return;

    const e = crt.find(x => x.productoId === id);

    if (e) {
        e.cantidad += q;
        e.subtotal = e.cantidad * e.precio;
    } else {
        crt.push({
            productoId: p.id,
            nombre: p.nombre,
            precio: p.precio,
            cantidad: q,
            subtotal: p.precio * q
        });
    }

    drawCrt();
}

function delCrt(i) {
    crt.splice(i, 1);
    drawCrt();
}

function drawCrt() {

    const tb = document.querySelector("#tablaCarritoModal tbody");
    tb.innerHTML = "";

    if (!crt.length) {
        tb.innerHTML = `<tr><td colspan="5">Carrito vacío</td></tr>`;
        calc();
        return;
    }

    crt.forEach((x, i) => {
        tb.innerHTML += `
            <tr>
                <td>${x.nombre}</td>
                <td>${x.cantidad}</td>
                <td>${formatoMoneda(x.precio)}</td>
                <td>${formatoMoneda(x.subtotal)}</td>
                <td>
                    <button class="btn btn-danger btn-sm"
                        onclick="delCrt(${i})">X</button>
                </td>
            </tr>
        `;
    });

    calc();
}
function calc() {

    const sub = crt.reduce((s, x) => s + x.subtotal, 0);
    const iva = sub * (impuestoPct / 100);


    let com = 0;
    let paga = 0;
    let cmb  = 0;

    const mt = document.querySelector("input[name='ventaMetodoModal']:checked")?.value;

    ocultar("infoTarjetaModal");
    ocultar("infoTransferenciaModal");
    ocultar("bloqueEfectivoModal");
    ocultar("bloqueMixtoModal");
    ocultar("bloqueComisionTarjeta");

    const pct = comisionTarjetaPct / 100;

    if (mt === "efectivo") {
        mostrar("bloqueEfectivoModal");
        paga = Number(ventaPagaConModal.value || 0);
    }

    if (mt === "tarjeta") {
        mostrar("infoTarjetaModal");
        mostrar("bloqueComisionTarjeta");

        com = sub * pct;
        paga = sub + iva + com;
    }

    if (mt === "transferencia") {
        mostrar("infoTransferenciaModal");
        paga = sub + iva;
    }

    if (mt === "mixto") {
        mostrar("bloqueMixtoModal");
        mostrar("bloqueComisionTarjeta");

        const ef = Number(mixtoEfectivo.value || 0);
        const tj = Number(mixtoTarjeta.value || 0);
        const tr = Number(mixtoTransferencia.value || 0);

        paga = ef + tj + tr;
        com  = tj * pct;
    }

    const ttl = sub + iva + com;

    if (mt === "efectivo" || mt === "mixto") {
        cmb = Math.max(paga - ttl, 0);
    }

    ventaSubtotalModal.textContent = formatoMoneda(sub);
    ventaImpuestoModal.textContent = formatoMoneda(iva);
    ventaComisionModal.textContent = formatoMoneda(com);
    ventaTotalModal.textContent    = formatoMoneda(ttl);
    ventaCambioModal.textContent   = formatoMoneda(cmb);
    const btn = document.getElementById("btnVentaCobrarModal");
if (btn) {
    btn.disabled = (function () {
        const total = Number(ventaTotalModal.textContent.replace(/[$,]/g, ""));
        let pagado = 0;

        if (mt === "efectivo") pagado = Number(ventaPagaConModal.value || 0);
        if (mt === "tarjeta" || mt === "transferencia") pagado = total;
        if (mt === "mixto") {
            pagado =
                Number(mixtoEfectivo.value || 0) +
                Number(mixtoTarjeta.value || 0) +
                Number(mixtoTransferencia.value || 0);
        }

        return pagado < total;
    })();
}

}



async function saveVta() {

    if (!crt.length) return
        alertaWarning("Carrito vacío");

    if (!validarPago()) return;

    const c = await ajaxGET("/api/cajas/actual");
    if (!c || c.estado !== "Abierta") return alertaError("No hay una caja abierta para registrar la venta");


    const mt = document.querySelector("input[name='ventaMetodoModal']:checked").value;

    const req = {
        clienteId: Number(ventaClienteModal.value || 0),
        usuarioId: 1,
        metodoPago: mt,
        total: Number(ventaTotalModal.textContent.replace(/[$,]/g, "")),
        comisionTarjetaPct: comisionTarjetaPct,
        pagos: mt === "mixto" ? {
            efectivo: Number(mixtoEfectivo.value || 0),
            tarjeta: Number(mixtoTarjeta.value || 0),
            transferencia: Number(mixtoTransferencia.value || 0)
        } : null,
        detalles: crt
    };

    const r = await ajaxPOST("/api/ventas/guardar", req);

    alertaExito("Venta guardada correctamente. Folio #" + r.id);


    crt = [];
    drawCrt();
    cerrarModal("modalVentas");
    loadVtas();
}


async function loadVtas() {
    renderVtas(await ajaxGET("/api/ventas/listar"));
}

function renderVtas(ls) {

    const tb = document.querySelector("#tablaVentas tbody");
    tb.innerHTML = "";

    if (!ls || !ls.length) {
        tb.innerHTML = `<tr><td colspan="8">Sin ventas</td></tr>`;
        return;
    }

    ls.forEach(v => {

        const c = cli.find(x => x.id === v.clienteId);
        const nom = c ? c.nombre : "N/A";

        tb.innerHTML += `
            <tr data-id="${v.id}">
                <td>${v.id}</td>
                <td>${v.fecha ?? ""}</td>
                <td>${nom}</td>
                <td>${v.metodoPago}</td>
                <td>${formatoMoneda(v.total)}</td>
                <td>
                    ${v.estado === "CANCELADA"
                        ? '<span class="badge badge-danger">Cancelada</span>'
                        : '<span class="badge badge-success">Pagada</span>'}
                </td>
                <td>Cajero</td>
                <td>
                    <button class="btn btn-info btn-sm"
                        onclick="verDet(${v.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="confirmarCancelarVenta(${v.id})"
                        ${v.estado === "CANCELADA" ? "disabled" : ""}>
                        <i class="bi bi-x-circle"></i>
                    </button>
                    <button class="btn btn-primary btn-sm"
                        onclick="ticketPDF(${v.id})">
                        <i class="bi bi-receipt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    resaltarDesdeConsulta();
}

async function ventasHoy() {
    renderVtas(await ajaxGET("/api/ventas/hoy"));
}

async function ventasPorFecha() {

    const f = filtroFechaVenta.value;
    if (!f) return msg("Selecciona fecha");

    renderVtas(await ajaxGET(`/api/ventas/fecha?fecha=${f}`));
}

async function verDet(id) {

    try {
        const v = await ajaxGET(`/api/ventas/${id}`);

        detalleVentaInfo.innerHTML = `
            <b>Folio:</b> ${v.id}<br>
            <b>Fecha:</b> ${v.fecha ?? ""}<br>
            <b>Método:</b> ${v.metodoPago}<br>
            <b>Total:</b> ${formatoMoneda(v.total)}
        `;

        const tb = detalleVentaTabla;
        tb.innerHTML = "";

        if (!v.detalles || !v.detalles.length) {
            tb.innerHTML = `<tr><td colspan="4">Sin productos</td></tr>`;
        } else {
            v.detalles.forEach(d => {
                const p = prd.find(x => x.id === d.productoId);
                tb.innerHTML += `
                    <tr>
                        <td>${p ? p.nombre : "Producto"}</td>
                        <td>${d.cantidad}</td>
                        <td>${formatoMoneda(d.precio)}</td>
                        <td>${formatoMoneda(d.subtotal)}</td>
                    </tr>
                `;
            });
        }

        abrirModal("modalDetalleVenta");

    } catch {
    alertaError("No se pudo cargar el detalle de la venta");
}

}

function alertaConfirmacion(titulo, mensaje, onAceptar) {
    alerta("warning", titulo, mensaje);

    const btn = document.querySelector("#modalAlertModern .btn-primary");

    btn.onclick = null;

    btn.onclick = () => {
        cerrarModal("modalAlertModern");
        if (typeof onAceptar === "function") onAceptar();
    };
}



async function ejecutarCancelacionVenta(id) {
    const r = await fetch(`/api/ventas/cancelar/${id}`, { method: "PUT" });
    if (!r.ok) {
        alertaError("No se pudo cancelar la venta");
        return;
    }
    alertaExito("Venta cancelada correctamente");
    loadVtas();
}


async function cargarReportePeriodo() {

    const i = repInicio.value;
    const f = repFin.value;

    if (!i || !f) return msg("Selecciona fechas");

    const d = await ajaxGET(`/api/ventas/reporte/periodo?inicio=${i}&fin=${f}`);

    repTotal.textContent      = formatoMoneda(d.total);
    repCantidad.textContent   = d.cantidad;
    repCanceladas.textContent = d.canceladas;
}

function abrirModalReportes() {
    abrirModal("modalReportes");
    repTotal.textContent="$0.00";
    repCantidad.textContent="0";
    repCanceladas.textContent="0";
}

function mostrar(id){ const e=document.getElementById(id); if(e)e.style.display="block"; }
function ocultar(id){ const e=document.getElementById(id); if(e)e.style.display="none"; }
function ticketPDF(id){ window.open(`/api/ventas/ticket/${id}`,"_blank"); }
function cargarVentas() {
    loadVtas();
}
function validarPago() {

    const total = Number(
        ventaTotalModal.textContent.replace(/[$,]/g, "")
    );

    const mt = document.querySelector("input[name='ventaMetodoModal']:checked")?.value;

    let pagado = 0;

    if (mt === "efectivo") {
        pagado = Number(ventaPagaConModal.value || 0);
    }

    if (mt === "tarjeta") {
        pagado = total;
    }

    if (mt === "transferencia") {
        pagado = total;
    }

    if (mt === "mixto") {
        const ef = Number(mixtoEfectivo.value || 0);
        const tj = Number(mixtoTarjeta.value || 0);
        const tr = Number(mixtoTransferencia.value || 0);
        pagado = ef + tj + tr;
    }

    if (pagado < total) {
        alertaWarning(`Pago incompleto. Faltan ${formatoMoneda(total - pagado)}`);

        return false;
    }

    return true;
}

function alerta(tipo, titulo, mensaje) {
    const box   = document.getElementById("alertBox");
    const icon  = document.getElementById("alertIcon");
    const title = document.getElementById("alertTitle");
    const msg   = document.getElementById("alertMessage");
    const btn   = document.getElementById("alertBtn");

    const icons = {
        info: "bi-info-circle",
        success: "bi-check-circle",
        error: "bi-x-circle",
        warning: "bi-exclamation-triangle"
    };

    box.className = `alert-box alert-${tipo}`;
    icon.innerHTML = `<i class="bi ${icons[tipo]}"></i>`;
    title.textContent = titulo;
    msg.textContent = mensaje;

    btn.onclick = () => cerrarModal("modalAlertModern");

    abrirModal("modalAlertModern");
}

const alertaInfo    = m => alerta("info",    "Información", m);
const alertaExito   = m => alerta("success", "Éxito", m);
const alertaError   = m => alerta("error",   "Error", m);
const alertaWarning = m => alerta("warning", "Atención", m);
function confirmarCancelarVenta(id) {
    alertaConfirmacion(
        "Cancelar venta",
        "¿Estás seguro de cancelar esta venta?",
        async () => {
            await ejecutarCancelacionVenta(id);
        }
    );
}
function alertaConfirmacion(titulo, mensaje, onAceptar) {
    alerta("warning", titulo, mensaje);

    const btn = document.getElementById("alertBtn");

    btn.onclick = () => {
        cerrarModal("modalAlertModern");
        if (typeof onAceptar === "function") onAceptar();
    };
}
function resaltarDesdeConsulta() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("resaltar");

    if (!id) return;

    const filas = document.querySelectorAll("#tablaVentas tbody tr");

    filas.forEach(tr => {
        if (tr.dataset.id == id) {
            tr.classList.add("resaltado");
            tr.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    });

    history.replaceState({}, document.title, location.pathname);
}
