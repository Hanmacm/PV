let provs = [];
let prods = [];
let cart  = [];
let compras = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadProveedores();
    await loadProductos();
    fillSelects();
    loadCompras();
    loadKPIs();

    btnCompAgregar.onclick = addItem;
    btnCompGuardar.onclick = saveCompra;
});

async function loadProveedores() {
    try {
        provs = await ajaxGET("/api/proveedores");
    } catch {
        provs = [];
        alertaError("No se pudieron cargar proveedores");
    }
}

async function loadProductos() {
    try {
        prods = await ajaxGET("/api/productos/activos");
    } catch {
        prods = [];
        alertaError("No se pudieron cargar productos");
    }
}

function fillSelects() {
    compProveedor.innerHTML = "";
    compProducto.innerHTML = "";

    provs.forEach(p =>
        compProveedor.innerHTML += `<option value="${p.id}">${p.nombre}</option>`
    );

    prods.forEach(p =>
        compProducto.innerHTML += `<option value="${p.id}">${p.nombre}</option>`
    );
}

function addItem() {
    const pid  = +compProducto.value;
    const cant = +compCantidad.value;
    const cost = +compCosto.value;

    if (!pid || cant <= 0 || cost <= 0)
        return alertaWarning("Revisa cantidad y costo");

    cart.push({ pid, cant, cost });
    drawCart();
}

function drawCart() {
    const tb = document.querySelector("#tablaCompra tbody");
    tb.innerHTML = "";

    if (!cart.length) {
        tb.innerHTML = `<tr><td colspan="5">Sin productos</td></tr>`;
        compTotal.textContent = "$0.00";
        return;
    }

    let sum = 0;

    cart.forEach((i, idx) => {
        const p = prods.find(x => x.id === i.pid);
        const imp = i.cant * i.cost;
        sum += imp;

        tb.innerHTML += `
        <tr>
            <td>${p?.nombre || "Producto"}</td>
            <td>${i.cant}</td>
            <td>$${i.cost.toFixed(2)}</td>
            <td>$${imp.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="delItem(${idx})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`;
    });

    compTotal.textContent = "$" + sum.toFixed(2);
}

function delItem(i) {
    cart.splice(i, 1);
    drawCart();
}

async function saveCompra() {

    if (!cart.length)
        return alertaWarning("Agrega productos a la compra");

    const body = {
        proveedorId: +compProveedor.value,
        usuarioId: window.usuarioActual?.id || 1,
        folio: compFolio.value.trim(),
        fecha: compFecha.value,
        detalle: cart.map(x => ({
            productoId: x.pid,
            cantidad: x.cant,
            costo: x.cost
        }))
    };

    if (!body.folio || !body.fecha)
        return alertaWarning("Completa los datos de la compra");

    try {
        await ajaxPOST("/api/compras", body);

        cart = [];
        drawCart();
        cerrarModal("modalCompra");
        loadCompras();
        loadKPIs();

        alertaExito("Compra registrada correctamente");

    } catch {
        alertaError("No se pudo guardar la compra");
    }
}

async function loadCompras() {
    try {
        compras = await ajaxGET("/api/compras");
        drawCompras();
    } catch {
        document.querySelector("#tablaCompras tbody").innerHTML =
            `<tr><td colspan="6">Error al cargar compras</td></tr>`;
    }
}

function drawCompras() {
    const tb = document.querySelector("#tablaCompras tbody");
    tb.innerHTML = "";

    if (!compras.length) {
        tb.innerHTML = `<tr><td colspan="6">Sin compras</td></tr>`;
        return;
    }

    compras.forEach(c => {
        const p = provs.find(x => x.id === c.proveedorId);
        const cancelada = c.estado === "CANCELADA";

        tb.innerHTML += `
        <tr data-id="${c.id}">
            <td>${c.folio}</td>
            <td>${p?.nombre || "N/D"}</td>
            <td>$${Number(c.total).toFixed(2)}</td>
            <td>${c.fecha?.replace("T"," ").substring(0,16)}</td>
            <td>
                <span class="badge ${cancelada ? "badge-danger" : "badge-success"}">
                    ${c.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-info btn-sm"
                    onclick="verDetalle(${c.id})">
                    <i class="bi bi-eye"></i>
                </button>

                <button class="btn btn-danger btn-sm"
                    onclick="cancelCompra(${c.id})"
                    ${cancelada ? "disabled" : ""}>
                    <i class="bi bi-x-circle"></i>
                </button>
            </td>
        </tr>`;
    });
    resaltarDesdeConsulta();

}

async function verDetalle(id) {
    abrirModal("modalDetalleCompra");

    try {
        const d = await ajaxGET(`/api/compras/${id}/detalle`);
        const tb = document.getElementById("detalleCompraTabla");
        tb.innerHTML = "";

        if (!d.length) {
            tb.innerHTML = `<tr><td colspan="4">Sin productos</td></tr>`;
            return;
        }

        d.forEach(x => {
            tb.innerHTML += `
            <tr>
                <td>${x.producto}</td>
                <td>${x.cantidad}</td>
                <td>$${Number(x.costo).toFixed(2)}</td>
                <td>$${Number(x.subtotal).toFixed(2)}</td>
            </tr>`;
        });

    } catch {
        alertaError("No se pudo cargar el detalle");
    }
}

function cancelCompra(id) {

    alertaConfirmacion(
        "Cancelar compra",
        "¿Deseas cancelar esta compra?",
        async () => {
            try {
                await fetch(`/api/compras/cancelar/${id}`, { method:"PUT" });
                loadCompras();
                loadKPIs();
                alertaWarning("Compra cancelada");
            } catch {
                alertaError("No se pudo cancelar");
            }
        }
    );
}

function abrirModalBuscarCompras() {
    abrirModal("modalBuscarCompras");
}

async function comprasHoy() {
    try {
        compras = await ajaxGET("/api/compras/hoy");
        drawCompras();
    } catch {
        alertaError("No se pudieron cargar compras de hoy");
    }
}

async function comprasPorFecha() {
    const f = filtroFechaCompra.value;
    if (!f) return alertaWarning("Selecciona una fecha");

    try {
        compras = await ajaxGET(`/api/compras/fecha?fecha=${f}`);
        drawCompras();
    } catch {
        alertaError("No se pudieron cargar las compras");
    }
}

async function loadKPIs() {
    try {
        const d = await ajaxGET("/api/compras/reporte");
        paintKPIs(d);
    } catch {}
}

async function cargarReportePeriodo() {
    if (!repInicio.value || !repFin.value)
        return alertaWarning("Selecciona rango de fechas");

    try {
        const d = await ajaxGET(
            `/api/compras/reporte/periodo?inicio=${repInicio.value}&fin=${repFin.value}`
        );
        paintKPIs(d);
    } catch {
        alertaError("No se pudo generar el reporte");
    }
}

function paintKPIs(d) {
    kpiTotalCompras.textContent = d.totalCompras ?? 0;
    kpiMontoTotal.textContent   = "$" + Number(d.montoTotal ?? 0).toFixed(2);
    kpiCanceladas.textContent   = d.comprasCanceladas ?? 0;
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

function alertaConfirmacion(titulo, mensaje, onAceptar) {

    alerta("warning", titulo, mensaje);

    const btn = document.getElementById("alertBtn");

    btn.onclick = () => {
        cerrarModal("modalAlertModern");
        if (typeof onAceptar === "function") {
            onAceptar();
        }
    };
}
function resaltarDesdeConsulta() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("resaltar");
    if (!id) return;

    setTimeout(() => {
        const fila = document.querySelector(
            `#tablaCompras tbody tr[data-id="${id}"]`
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
