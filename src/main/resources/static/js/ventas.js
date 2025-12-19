let crt = [];
let prd = [];
let cli = [];

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
    const iva = sub * 0.16;

    let com = 0;
    const mt = document.querySelector("input[name='ventaMetodoModal']:checked")?.value || "efectivo";

    ocultar("infoTarjetaModal");
    ocultar("infoTransferenciaModal");
    ocultar("bloqueEfectivoModal");

    if (mt === "tarjeta") {
        com = sub * 0.03;
        mostrar("infoTarjetaModal");
    }

    if (mt === "transferencia") {
        mostrar("infoTransferenciaModal");
    }

    if (mt === "efectivo") {
        mostrar("bloqueEfectivoModal");
    }

    const ttl = sub + iva + com;
    const paga = Number(ventaPagaConModal.value || 0);
    const cmb  = mt === "efectivo" ? Math.max(paga - ttl, 0) : 0;

    ventaSubtotalModal.textContent = formatoMoneda(sub);
    ventaImpuestoModal.textContent = formatoMoneda(iva);
    ventaComisionModal.textContent = formatoMoneda(com);
    ventaTotalModal.textContent    = formatoMoneda(ttl);
    ventaCambioModal.textContent   = formatoMoneda(cmb);
}

async function saveVta() {

    if (!crt.length) return msg("Carrito vacío");

    const c = await ajaxGET("/api/cajas/actual");
    if (!c || c.estado !== "Abierta") return msg("No hay caja abierta");

    const req = {
        clienteId: Number(ventaClienteModal.value || 0),
        usuarioId: 1,
        metodoPago: document.querySelector("input[name='ventaMetodoModal']:checked").value,
        total: Number(ventaTotalModal.textContent.replace("$","")),
        detalles: crt
    };

    const r = await ajaxPOST("/api/ventas/guardar", req);

    msg("Venta guardada #" + r.id);

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
            <tr>
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
                        onclick="canVta(${v.id})"
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
        msg("Error cargando detalle");
    }
}

async function canVta(id) {

    if (!confirm("¿Cancelar venta?")) return;

    const r = await fetch(`/api/ventas/cancelar/${id}`, { method: "PUT" });
    if (!r.ok) return msg("No se pudo cancelar");

    msg("Venta cancelada");
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
