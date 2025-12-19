let facturasCache = [];
let ventasCache = [];
let clientesCache = [];

document.addEventListener("DOMContentLoaded", () => {
    try {
        cargarVentas();
        cargarClientes();
        cargarFacturas();
    } catch (e) {
        console.error("Init facturación:", e);
    }
});

async function cargarVentas() {
    let select = document.getElementById("factVenta");
    if (!select) return;

    select.innerHTML = `<option value="">Cargando ventas...</option>`;

    try {
        const res = await fetch("/api/ventas/facturables");
        if (!res.ok) throw new Error("No se pudo cargar ventas facturables");

        const ventas = await res.json();
        ventasCache = Array.isArray(ventas) ? ventas : [];

        select.innerHTML = `<option value="">Seleccione...</option>`;

        ventasCache
            .filter(v => (v.estado || "").toUpperCase() === "PAGADA")
            .forEach(v => {
                select.innerHTML += `
                    <option value="${v.id}">
                        Venta #${v.id} - Total: $${Number(v.total || 0).toFixed(2)}
                    </option>
                `;
            });

        if (select.options.length === 1) {
            select.innerHTML = `<option value="">No hay ventas pagadas para facturar</option>`;
        }

    } catch (err) {
        console.error("cargarVentas:", err);
        select.innerHTML = `<option value="">Error al cargar ventas</option>`;
        alert("No pude cargar las ventas para facturar. Revisa tu servidor.");
    }
}

async function cargarClientes() {
    let select = document.getElementById("factCliente");
    if (!select) return;

    select.innerHTML = `<option value="">Cargando clientes...</option>`;

    try {
        const res = await fetch("/api/clientes");
        if (!res.ok) throw new Error("No se pudo cargar clientes");

        const data = await res.json();
        clientesCache = Array.isArray(data) ? data : [];

        select.innerHTML = `<option value="">Seleccione un cliente...</option>`;

        clientesCache.forEach(c => {
            select.innerHTML += `
                <option value="${c.nombre}">
                    ${c.nombre} ${c.telefono ? "(" + c.telefono + ")" : ""}
                </option>
            `;
        });

        if (select.options.length === 1) {
            select.innerHTML = `<option value="">No hay clientes disponibles</option>`;
        }

    } catch (err) {
        console.error("cargarClientes:", err);
        select.innerHTML = `<option value="">Error al cargar clientes</option>`;
        alert("No pude cargar clientes. Revisa el backend.");
    }
}

async function cargarFacturas() {
    let tbody = document.querySelector("#tablaFacturas tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="11">Cargando facturas...</td></tr>`;

    try {
        const res = await fetch("/facturas/listar");
        if (!res.ok) throw new Error("No se pudo listar facturas");

        const data = await res.json();
        facturasCache = Array.isArray(data) ? data : [];

        renderFacturas(facturasCache);

    } catch (err) {
        console.error("cargarFacturas:", err);
        tbody.innerHTML = `<tr><td colspan="11">No se pudieron cargar las facturas.</td></tr>`;
        alert("Algo falló al cargar facturas. Intenta recargar la página.");
    }
}

function renderFacturas(lista) {
    let tbody = document.querySelector("#tablaFacturas tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11">Sin facturas todavía.</td></tr>`;
        return;
    }

    lista.forEach(f => {
        const estado = (f.estado || "").toUpperCase();

        const badgeEstado = estado === "ACTIVA"
            ? `<span class="badge badge-success">ACTIVA</span>`
            : `<span class="badge badge-danger">CANCELADA</span>`;

        const botones = estado === "ACTIVA"
            ? `
                <button class="btn btn-danger btn-small" onclick="cancelarFactura(${f.id})" title="Cancelar">
                    <i class="bi bi-x-circle"></i>
                </button>
                <button class="btn btn-small" onclick="verPDF(${f.id})" title="Ver PDF">
                    <i class="bi bi-printer"></i>
                </button>
              `
            : `
                <button class="btn btn-small" onclick="verPDF(${f.id})" title="Ver PDF">
                    <i class="bi bi-printer"></i>
                </button>
              `;

        const fecha = f.fecha ? String(f.fecha).replace("T", " ").substring(0, 16) : "-";
        const total = Number(f.total || 0).toFixed(2);

        tbody.innerHTML += `
            <tr>
                <td>${f.id ?? ""}</td>
                <td>${f.ventaId ?? ""}</td>
                <td>${f.cliente ?? ""}</td>
                <td>${f.razonSocial ?? ""}</td>
                <td>${f.rfc ?? ""}</td>
                <td>${f.usoCfdi ?? ""}</td>
                <td>$${total}</td>
                <td>${Number(f.timbrado || 0) === 1 ? "✔" : "✘"}</td>
                <td>${fecha}</td>
                <td>${badgeEstado}</td>
                <td>${botones}</td>
            </tr>
        `;
    });
}

async function generarFactura() {
    const ventaId = document.getElementById("factVenta")?.value;
    const cliente = document.getElementById("factCliente")?.value;
    const rfc = (document.getElementById("factRFC")?.value || "").trim();
    const razon = (document.getElementById("factRazon")?.value || "").trim();
    const uso = document.getElementById("factUso")?.value || "P01";
    const timbrado = document.getElementById("factTimbrado")?.checked ? 1 : 0;

    if (!ventaId) return alert("Te faltó seleccionar la venta.");
    if (!cliente) return alert("Selecciona el cliente.");
    if (!rfc) return alert("Pon el RFC (aunque sea genérico).");
    if (!razon) return alert("Falta la razón social.");

    let ventaSel = ventasCache.find(v => String(v.id) === String(ventaId));

    if (!ventaSel) {
        try {
            const resVenta = await fetch("/api/ventas/listar");
            const ventas = await resVenta.json();
            ventasCache = Array.isArray(ventas) ? ventas : [];
            ventaSel = ventasCache.find(v => String(v.id) === String(ventaId));
        } catch (e) {
            console.error("Ventas fallback:", e);
        }
    }

    if (!ventaSel) return alert("No encontré esa venta. Revisa que exista.");

    const factura = {
        ventaId: parseInt(ventaId),
        cliente: cliente,
        rfc: rfc,
        razonSocial: razon,
        usoCfdi: uso,
        total: Number(ventaSel.total || 0),
        timbrado: timbrado
    };

    try {
        const res = await fetch("/facturas/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(factura)
        });

        if (!res.ok) {
            const txt = await res.text();
            alert(txt || "No se pudo generar la factura.");
            return;
        }

        cerrarModal("modalFactura");
        alert("Listo ✅ Factura generada.");
        await cargarFacturas();
        await cargarVentas();

        limpiarFormFactura();

    } catch (err) {
        console.error("generarFactura:", err);
        alert("Se cayó la conexión al generar la factura.");
    }
}

function limpiarFormFactura() {
    const ids = ["factVenta", "factCliente", "factRFC", "factRazon"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    const chk = document.getElementById("factTimbrado");
    if (chk) chk.checked = false;

    const uso = document.getElementById("factUso");
    if (uso) uso.value = "P01";
}

function verPDF(id) {
    if (!id) return;
    window.open(`/facturas/pdf/${id}`, "_blank");
}

async function cancelarFactura(id) {
    if (!id) return;

    const ok = confirm("¿Seguro que quieres cancelar esta factura?");
    if (!ok) return;

    try {
        const res = await fetch(`/facturas/cancelar/${id}`, { method: "PUT" });

        if (!res.ok) {
            const txt = await res.text();
            alert(txt || "No se pudo cancelar.");
            return;
        }

        alert("Factura cancelada ✅");
        cargarFacturas();

    } catch (e) {
        console.error("cancelarFactura:", e);
        alert("No pude cancelar. Revisa tu servidor.");
    }
}

async function abrirReporteFacturas() {
    abrirModal("modalReporteFacturas");

    document.getElementById("kpiTotalFacturado").textContent = "$0";
    document.getElementById("kpiFacturasActivas").textContent = "0";
    document.getElementById("kpiFacturasCanceladas").textContent = "0";
    document.getElementById("kpiTotalCancelado").textContent = "$0";

    try {
        const r = await fetch("/facturas/reportes/kpis");
        if (!r.ok) throw new Error("KPIs no disponibles");
        const data = await r.json();

        document.getElementById("kpiTotalFacturado").textContent =
            "$" + Number(data.totalFacturado || 0).toFixed(2);

        document.getElementById("kpiFacturasActivas").textContent =
            Number(data.facturasActivas || 0);

        document.getElementById("kpiFacturasCanceladas").textContent =
            Number(data.facturasCanceladas || 0);

        document.getElementById("kpiTotalCancelado").textContent =
            "$" + Number(data.totalCancelado || 0).toFixed(2);

    } catch (e) {
        console.error("abrirReporteFacturas:", e);
        alert("No pude cargar los KPIs del reporte.");
    }
}

async function filtrarReporteFacturas() {
    const ini = document.getElementById("repInicio")?.value;
    const fin = document.getElementById("repFin")?.value;

    if (!ini || !fin) {
        alert("Pon fecha inicio y fin.");
        return;
    }

    let tbody = document.querySelector("#tablaReporteFacturas tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5">Buscando...</td></tr>`;

    try {
        const res = await fetch(`/facturas/reportes/periodo?inicio=${ini}&fin=${fin}`);
        if (!res.ok) throw new Error("No se pudo filtrar");

        const data = await res.json();
        const lista = Array.isArray(data) ? data : [];

        tbody.innerHTML = "";

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No cayó nada en ese rango.</td></tr>`;
            return;
        }

        lista.forEach(f => {
            const estado = (f.estado || "").toUpperCase();
            const badge = estado === "ACTIVA" ? "badge-success" : "badge-danger";
            const fecha = f.fecha ? String(f.fecha).replace("T", " ").substring(0, 16) : "-";
            const total = Number(f.total || 0).toFixed(2);

            tbody.innerHTML += `
                <tr>
                    <td>${f.id}</td>
                    <td>${f.cliente ?? ""}</td>
                    <td>$${total}</td>
                    <td><span class="badge ${badge}">${estado}</span></td>
                    <td>${fecha}</td>
                </tr>
            `;
        });

    } catch (e) {
        console.error("filtrarReporteFacturas:", e);
        tbody.innerHTML = `<tr><td colspan="5">No se pudo filtrar el reporte.</td></tr>`;
        alert("Algo falló al filtrar. Intenta otra vez.");
    }
}

function abrirModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
}

function cerrarModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}
