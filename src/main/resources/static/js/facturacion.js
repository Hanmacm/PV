
let facturasCache = [];
let ventasCache = [];
let clientesCache = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarVentas();
    cargarClientes();
    cargarFacturas();
});

async function cargarVentas() {
    const select = document.getElementById("factVenta");
    if (!select) return;

    select.innerHTML = `<option value="">Cargando ventas...</option>`;

    try {
        const res = await fetch("/api/ventas/facturables");
        if (!res.ok) throw new Error();

        ventasCache = await res.json() || [];
        select.innerHTML = `<option value="">Seleccione...</option>`;

        ventasCache
            .filter(v => (v.estado || "").toUpperCase() === "PAGADA")
            .forEach(v => {
                select.innerHTML += `
                    <option value="${v.id}">
                        Venta #${v.id} - $${Number(v.total || 0).toFixed(2)}
                    </option>`;
            });

        if (select.options.length === 1) {
            select.innerHTML = `<option value="">No hay ventas pagadas</option>`;
        }

    } catch {
        select.innerHTML = `<option value="">Error al cargar ventas</option>`;
        alertaError("No se pudieron cargar las ventas facturables");
    }
}

async function cargarClientes() {
    const select = document.getElementById("factCliente");
    if (!select) return;

    try {
        const res = await fetch("/api/clientes/activos");
        if (!res.ok) throw new Error();

        clientesCache = await res.json() || [];

        select.innerHTML = `<option value="">Seleccione...</option>`;

        clientesCache.forEach(c => {
            select.innerHTML += `
                <option value="${c.id}">
                    ${c.nombre}
                </option>
            `;
        });

    } catch (e) {
        console.error(e);
        select.innerHTML = `<option value="">Error al cargar clientes</option>`;
        alertaError("No se pudieron cargar los clientes");
    }
}
document.addEventListener("change", (e) => {
    if (e.target.id !== "factCliente") return;

    const id = e.target.value;
    const cli = clientesCache.find(c => c.id == id);
    if (!cli) return;

    factRFC.value   = cli.rfc || "";
    factRazon.value = cli.razonSocial || "";
    factUso.value   = cli.usoCfdi || "P01";
});

async function cargarFacturas() {
    const tbody = document.querySelector("#tablaFacturas tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="11">Cargando...</td></tr>`;

    try {
        const res = await fetch("/facturas/listar");
        if (!res.ok) throw new Error();

        facturasCache = await res.json() || [];
        renderFacturas(facturasCache);

    } catch {
        tbody.innerHTML = `<tr><td colspan="11">Error al cargar facturas</td></tr>`;
        alertaError("No se pudieron cargar las facturas");
    }
}

function renderFacturas(lista) {
    const tbody = document.querySelector("#tablaFacturas tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="11">Sin facturas</td></tr>`;
        return;
    }

    lista.forEach(f => {
        const estado = (f.estado || "").toUpperCase();
        const badge = estado === "ACTIVA"
            ? `<span class="badge badge-success">ACTIVA</span>`
            : `<span class="badge badge-danger">CANCELADA</span>`;

        tbody.innerHTML += `
            <tr>
                <td>${f.id}</td>
                <td>${f.ventaId}</td>
                <td>${f.cliente}</td>
                <td>${f.razonSocial}</td>
                <td>${f.rfc}</td>
                <td>${f.usoCfdi}</td>
                <td>$${Number(f.total).toFixed(2)}</td>
                <td>${f.timbrado ? "✔" : "✘"}</td>
                <td>${f.fecha?.replace("T"," ").substring(0,16) || "-"}</td>
                <td>${badge}</td>
                <td>
                    ${estado === "ACTIVA"
                        ? `<button class="btn btn-danger btn-sm" onclick="cancelarFactura(${f.id})">
                               <i class="bi bi-x-circle"></i>
                           </button>`
                        : ""}
                    <button class="btn btn-info btn-sm" onclick="verPDF(${f.id})">
                        <i class="bi bi-printer"></i>
                    </button>
                </td>
            </tr>`;
    });
}

async function generarFactura() {

    const ventaId = factVenta.value;
    const clienteId = factCliente.value;
const cli = clientesCache.find(c => c.id == clienteId);

if (!cli) return alertaError("Cliente no encontrado");

const clienteNombre = cli.nombre;

    const rfc = factRFC.value.trim();
    const razon = factRazon.value.trim();
    const uso = factUso.value;
    const timbrado = factTimbrado.checked ? 1 : 0;

    if (!ventaId) return alertaWarning("Selecciona una venta");
    if (!clienteId) return alertaWarning("Selecciona un cliente");
    if (!rfc) return alertaWarning("Ingresa el RFC");
    if (!razon) return alertaWarning("Ingresa la razón social");
const yaFacturada = facturasCache.some(f => 
    String(f.ventaId) === String(ventaId) && f.estado === "ACTIVA"
);

if (yaFacturada) {
    return alertaWarning("Esta venta ya fue facturada");
}

    const venta = ventasCache.find(v => String(v.id) === String(ventaId));
    if (!venta) return alertaError("Venta no encontrada");

    const body = {
    ventaId: Number(ventaId),
    cliente: clienteNombre,
    rfc,
    razonSocial: razon,
    usoCfdi: uso,
    total: Number(venta.total),
    timbrado
};


    try {
        const res = await fetch("/facturas/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const t = await res.text();
            return alertaError(t || "No se pudo generar la factura");
        }

        cerrarModal("modalFactura");
        alertaExito("Factura generada correctamente");
        cargarFacturas();
        cargarVentas();
        limpiarFormFactura();

    } catch {
        alertaError("Error al generar la factura");
    }
}

function cancelarFactura(id) {
    alertaConfirmacion(
        "Cancelar factura",
        "¿Deseas cancelar esta factura?",
        async () => {
            try {
                const r = await fetch(`/facturas/cancelar/${id}`, { method: "PUT" });
                if (!r.ok) throw new Error();

                alertaWarning("Factura cancelada");
                cargarFacturas();

            } catch {
                alertaError("No se pudo cancelar la factura");
            }
        }
    );
}

async function abrirReporteFacturas() {
    abrirModal("modalReporteFacturas");

    try {
        const r = await fetch("/facturas/reportes/kpis");
        const d = await r.json();

        kpiTotalFacturado.textContent = "$" + Number(d.totalFacturado).toFixed(2);
        kpiFacturasActivas.textContent = d.facturasActivas;
        kpiFacturasCanceladas.textContent = d.facturasCanceladas;
        kpiTotalCancelado.textContent = "$" + Number(d.totalCancelado).toFixed(2);

    } catch {
        alertaError("No se pudo cargar el reporte");
    }
}

function verPDF(id) {
    window.open(`/facturas/pdf/${id}`, "_blank");
}

function limpiarFormFactura() {
    factVenta.value = "";
    factCliente.value = "";
    factRFC.value = "";
    factRazon.value = "";
    factUso.value = "P01";
    factTimbrado.checked = false;
}

function alerta(tipo, titulo, mensaje) {
    alertBox.className = `alert-box alert-${tipo}`;
    alertIcon.innerHTML = `<i class="bi bi-${{
        info:"info-circle",
        success:"check-circle",
        warning:"exclamation-triangle",
        error:"x-circle"
    }[tipo]}"></i>`;
    alertTitle.textContent = titulo;
    alertMessage.textContent = mensaje;
    alertBtn.onclick = () => cerrarModal("modalAlertModern");
    abrirModal("modalAlertModern");
}

const alertaInfo    = m => alerta("info","Información",m);
const alertaExito   = m => alerta("success","Éxito",m);
const alertaWarning = m => alerta("warning","Atención",m);
const alertaError   = m => alerta("error","Error",m);

function alertaConfirmacion(t,m,ok){
    alerta("warning",t,m);
    alertBtn.onclick = () => {
        cerrarModal("modalAlertModern");
        ok();
    };
}
async function filtrarReporteFacturas() {

    const ini = document.getElementById("repInicio")?.value;
    const fin = document.getElementById("repFin")?.value;

    if (!ini || !fin) {
        return alertaWarning("Selecciona fecha inicio y fin");
    }

    const tbody = document.querySelector("#tablaReporteFacturas tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5">Buscando...</td></tr>`;

    try {
        const res = await fetch(
            `/facturas/reportes/periodo?inicio=${ini}&fin=${fin}`
        );

        if (!res.ok) {
            throw new Error("Error al filtrar");
        }

        const lista = await res.json();

        tbody.innerHTML = "";

        if (!lista.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">No hay facturas en ese rango</td>
                </tr>`;
            return;
        }

        lista.forEach(f => {
            const estado = (f.estado || "").toUpperCase();
            const badge = estado === "ACTIVA"
                ? "badge-success"
                : "badge-danger";

            const fecha = f.fecha
                ? f.fecha.replace("T", " ").substring(0, 16)
                : "-";

            tbody.innerHTML += `
                <tr>
                    <td>${f.id}</td>
                    <td>${f.cliente || "-"}</td>
                    <td>$${Number(f.total || 0).toFixed(2)}</td>
                    <td>
                        <span class="badge ${badge}">
                            ${estado}
                        </span>
                    </td>
                    <td>${fecha}</td>
                </tr>
            `;
        });

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `
            <tr>
                <td colspan="5">Error al filtrar reporte</td>
            </tr>`;
        alertaError("No se pudo filtrar el reporte");
    }
}
