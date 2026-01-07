let cajaActual = null;
let historial = [];

const $ = id => document.getElementById(id);

const money = n => "$" + Number(n || 0).toFixed(2);

document.addEventListener("DOMContentLoaded", async () => {
    await refrescarCaja();
    await cargarMovimientos();
    await cargarHistorial();
});

async function refrescarCaja() {
    try {
        cajaActual = await ajaxGET("/api/cajas/actual");
        cajaActualLabel.textContent =
            `Caja #${cajaActual.id} abierta`;
        cajaActualLabel.className = "badge badge-success";
    } catch {
        cajaActual = null;
        cajaActualLabel.textContent = "No hay caja abierta";
        cajaActualLabel.className = "badge badge-secondary";
    }
}

async function abrirCaja() {
    const monto = Number(cajaMontoInicial.value);

    if (!Number.isFinite(monto) || monto < 0)
        return alertaWarning("Monto inicial inválido");

    try {
        await ajaxPOST(`/api/cajas/abrir?monto=${monto}&usuario=1`);
        alertaExito("Caja abierta correctamente");
        await refrescarCaja();
        await cargarHistorial();
    } catch {
        alertaError("No se pudo abrir la caja");
    }
}

async function cerrarCaja() {
    try {
        await ajaxPOST("/api/cajas/cerrar");
        alertaInfo("Caja cerrada");
        await refrescarCaja();
        await cargarHistorial();
        await cargarMovimientos();
    } catch {
        alertaError("No se pudo cerrar la caja");
    }
}

async function agregarMovimiento() {

    if (!cajaActual)
        return alertaWarning("No hay caja abierta");

    const tipo = cajaTipoMov.value;
    const monto = Number(cajaMontoMov.value);
    const concepto = cajaConcepto.value.trim() || "Movimiento";

    if (!Number.isFinite(monto) || monto <= 0)
        return alertaWarning("Monto inválido");

    try {
        await ajaxPOST(
            `/api/cajas/movimiento?tipo=${tipo}&monto=${monto}&concepto=${encodeURIComponent(concepto)}`
        );

        cajaMontoMov.value = "";
        cajaConcepto.value = "";

        alertaExito("Movimiento registrado");
        await cargarMovimientos();

    } catch {
        alertaError("No se pudo registrar el movimiento");
    }
}

async function cargarMovimientos() {
    const tb = $("tablaMovimientos").querySelector("tbody");
    tb.innerHTML = "";

    if (!cajaActual || !cajaActual.movimientos?.length) {
        tb.innerHTML = `<tr><td colspan="4">Sin movimientos</td></tr>`;
        return;
    }

    cajaActual.movimientos.forEach(m => {
        tb.innerHTML += `
        <tr>
            <td>${m.tipo}</td>
            <td>${money(m.monto)}</td>
            <td>${m.concepto}</td>
            <td>${m.fecha?.replace("T"," ")}</td>
        </tr>`;
    });
}

async function cargarHistorial() {
    const tb = $("tablaCajas").querySelector("tbody");

    try {
        historial = await ajaxGET("/api/cajas/historial");
    } catch {
        historial = [];
    }

    if (!historial.length) {
        tb.innerHTML = `<tr><td colspan="7">Sin registros</td></tr>`;
        return;
    }

    tb.innerHTML = "";
    historial.forEach(c => {
        tb.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.fechaInicio?.replace("T"," ")}</td>
            <td>${c.fechaCierre?.replace("T"," ") || "-"}</td>
            <td>${money(c.montoInicial)}</td>
            <td>${c.montoFinal ? money(c.montoFinal) : "-"}</td>
            <td>${c.estado}</td>
            <td>
                ${c.estado === "Cerrada"
                  ? `<button class="btn btn-info btn-sm"
                        onclick="verDetalleCaja(${c.id})">
                        <i class="bi bi-eye"></i>
                     </button>`
                  : "-"
                }
            </td>
        </tr>`;
    });
}

async function verDetalleCaja(id) {

    abrirModal("modalDetalleCaja");

    const tabla = $("tablaDetalleCaja");
    if (!tabla) {
        console.error("tablaDetalleCaja no existe en el DOM");
        return alertaError("Error interno de interfaz");
    }

    const tb = tabla.querySelector("tbody");
    if (!tb) {
        console.error("tbody no existe en tablaDetalleCaja");
        return alertaError("Error interno de tabla");
    }

    tb.innerHTML = `<tr><td colspan="4">Cargando...</td></tr>`;

    try {
        const movs = await ajaxGET(`/api/cajas/${id}/movimientos`);

        if (!movs.length) {
            tb.innerHTML = `<tr><td colspan="4">Sin movimientos</td></tr>`;
            return;
        }

        tb.innerHTML = "";
        movs.forEach(m => {
            tb.innerHTML += `
            <tr>
                <td>${m.tipo}</td>
                <td>${money(m.monto)}</td>
                <td>${m.concepto}</td>
                <td>${m.fecha?.replace("T"," ")}</td>
            </tr>`;
        });

    } catch {
        tb.innerHTML = `<tr><td colspan="4">Error cargando detalle</td></tr>`;
    }
}

async function abrirReporteCajas() {

    abrirModal("modalReporteCajas");

    try {
        const r = await ajaxGET("/api/cajas/reporte");

        kpiTotalCajas.textContent = r.totalCajas ?? 0;
        kpiAbiertas.textContent   = r.cajasAbiertas ?? 0;
        kpiCerradas.textContent   = r.cajasCerradas ?? 0;
        kpiEntradas.textContent   = money(r.totalEntradas);
        kpiSalidas.textContent    = money(r.totalSalidas);
        kpiBalance.textContent    = money(r.balance);

    } catch {
        alertaError("No se pudo cargar el reporte");
    }
}

function alerta(tipo, titulo, mensaje) {

    alertBox.className = `alert-box alert-${tipo}`;
    alertIcon.innerHTML = `<i class="bi bi-${
        tipo === "success" ? "check-circle" :
        tipo === "error"   ? "x-circle" :
        tipo === "warning" ? "exclamation-triangle" :
                             "info-circle"
    }"></i>`;

    alertTitle.textContent = titulo;
    alertMessage.textContent = mensaje;

    alertBtn.onclick = () => cerrarModal("modalAlertModern");
    abrirModal("modalAlertModern");
}

const alertaInfo    = m => alerta("info", "Información", m);
const alertaExito   = m => alerta("success", "Éxito", m);
const alertaWarning = m => alerta("warning", "Atención", m);
const alertaError   = m => alerta("error", "Error", m);

function alertaConfirmacion(t, m, ok) {
    alerta("warning", t, m);
    alertBtn.onclick = () => {
        cerrarModal("modalAlertModern");
        ok && ok();
    };
}
