let provs = [];
let prods = [];
let cart = [];
let compras = [];

document.addEventListener("DOMContentLoaded", async () => {
    await getProv();
    await getProd();
    fillSelects();
    loadCompras();
    loadKPIs();

    document.getElementById("btnCompAgregar").onclick = addItem;
    document.getElementById("btnCompGuardar").onclick = saveCompra;
});

/* CARGAS INICIALES */
async function getProv() {
    try {
        provs = await (await fetch("/api/proveedores")).json();
    } catch {
        provs = [];
    }
}

async function getProd() {
    try {
        prods = await (await fetch("/api/productos/activos")).json();
    } catch {
        prods = [];
    }
}

function fillSelects() {
    const sp = document.getElementById("compProveedor");
    const sd = document.getElementById("compProducto");

    sp.innerHTML = "";
    sd.innerHTML = "";

    provs.forEach(p => {
        sp.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });

    prods.forEach(p => {
        sd.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });
}

/* CARRITO */
function addItem() {
    const pid = Number(compProducto.value);
    const cant = Number(compCantidad.value);
    const cost = Number(compCosto.value);

    if (!pid || cant <= 0 || cost <= 0) {
        alert("Revisa cantidad y costo");
        return;
    }

    cart.push({ pid, cant, cost });
    drawCart();
}

function drawCart() {
    const tb = document.querySelector("#tablaCompra tbody");
    tb.innerHTML = "";

    if (cart.length === 0) {
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
            <td>${p ? p.nombre : i.pid}</td>
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

/* GUARDAR COMPRA */
async function saveCompra() {

    if (cart.length === 0) {
        alert("Agrega productos primero");
        return;
    }

    const folio = compFolio.value.trim();
    const fecha = compFecha.value;
    const provId = Number(compProveedor.value);

    if (!folio || !fecha || !provId) {
        alert("Completa los datos de la compra");
        return;
    }

    const body = {
        proveedorId: provId,
        usuarioId: window.usuarioActual ? window.usuarioActual.id : 1,
        folio,
        fecha,
        detalle: cart.map(x => ({
            productoId: x.pid,
            cantidad: x.cant,
            costo: x.cost
        }))
    };

    try {
        const r = await fetch("/api/compras", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!r.ok) throw "err";

        cart = [];
        drawCart();
        cerrarModal("modalCompra");
        loadCompras();
        loadKPIs();

        alert("Compra registrada");

    } catch {
        alert("No se pudo guardar la compra");
    }
}

/* LISTADO COMPRAS */
async function loadCompras() {
    try {
        compras = await (await fetch("/api/compras")).json();
        drawCompras();
    } catch {
        document.querySelector("#tablaCompras tbody").innerHTML =
            `<tr><td colspan="6">Error al cargar</td></tr>`;
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

        tb.innerHTML += `
        <tr>
            <td>${c.folio}</td>
            <td>${p ? p.nombre : "N/D"}</td>
            <td>$${Number(c.total).toFixed(2)}</td>
            <td>${c.fecha?.replace("T", " ")}</td>
            <td>
                <span class="badge ${c.estado === "CANCELADA" ? "badge-danger" : "badge-success"}">
                    ${c.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-info btn-sm" onclick="verDetalle(${c.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm"
                    onclick="cancelCompra(${c.id})"
                    ${c.estado === "CANCELADA" ? "disabled" : ""}>
                    <i class="bi bi-x-circle"></i>
                </button>
            </td>
        </tr>`;
    });
}

/* CANCELAR */
async function cancelCompra(id) {

    if (!confirm("¿Cancelar esta compra?")) return;

    try {
        const r = await fetch(`/api/compras/cancelar/${id}`, { method: "PUT" });
        if (!r.ok) throw "err";

        loadCompras();
        loadKPIs();
        alert("Compra cancelada");

    } catch {
        alert("No se pudo cancelar");
    }
}

/* FILTROS */
async function comprasHoy() {
    compras = await (await fetch("/api/compras/hoy")).json();
    drawCompras();
}

async function comprasPorFecha() {
    const f = filtroFechaCompra.value;
    if (!f) return alert("Selecciona fecha");

    compras = await (await fetch(`/api/compras/fecha?fecha=${f}`)).json();
    drawCompras();
}

/* DETALLE */
async function verDetalle(id) {
    abrirModal("modalDetalleCompra");

    const r = await fetch(`/api/compras/${id}/detalle`);
    const d = await r.json();

    const tb = document.getElementById("detalleCompraTabla");
    tb.innerHTML = "";

    d.forEach(x => {
        tb.innerHTML += `
        <tr>
            <td>${x.producto}</td>
            <td>${x.cantidad}</td>
            <td>$${x.costo}</td>
            <td>$${x.subtotal}</td>
        </tr>`;
    });
}

/* KPIs Y REPORTES*/
async function loadKPIs() {
    try {
        const d = await (await fetch("/api/compras/reporte")).json();
        paintKPIs(d);
    } catch {}
}

async function cargarReporteGeneral() {
    const d = await (await fetch("/api/compras/reporte")).json();
    paintKPIs(d);
}

async function cargarReportePeriodo() {
    const i = repInicio.value;
    const f = repFin.value;

    if (!i || !f) return alert("Selecciona fechas");

    const d = await (
        await fetch(`/api/compras/reporte/periodo?inicio=${i}&fin=${f}`)
    ).json();

    paintKPIs(d);
}

function paintKPIs(d) {
    kpiTotalCompras.textContent = d.totalCompras ?? 0;
    kpiMontoTotal.textContent = "$" + Number(d.montoTotal ?? 0).toFixed(2);
    kpiRegistradas.textContent = d.comprasRegistradas ?? 0;
    kpiCanceladas.textContent = d.comprasCanceladas ?? 0;
}
