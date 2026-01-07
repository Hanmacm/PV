let arrCli = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarTodo();
});

async function cargarTodo() {
    try {
        arrCli = await ajaxGET("/api/clientes");
    } catch {
        arrCli = [];
        alertaError("No se pudieron cargar los clientes");
    }
    pintar();
}

function pintar() {

    const tb = document.querySelector("#tablaClientes tbody");
    tb.innerHTML = "";

    if (!arrCli.length) {
        tb.innerHTML = `<tr><td colspan="6">Sin clientes registrados</td></tr>`;
        return;
    }

    arrCli.forEach(c => {
        tb.innerHTML += `
        <tr data-id="${c.id}">
            <td>${c.nombre}</td>
            <td>${c.telefono || "-"}</td>
            <td>${c.correo || "-"}</td>
            <td>${c.direccion || "-"}</td>
            <td>
                <span class="badge ${c.estado === "ACTIVO" ? "badge-success" : "badge-secondary"}">
                    ${c.estado}
                </span>
            </td>
            <td>
                <button class="btn btn-primary btn-sm"
                        onclick="editarCliente(${c.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-warning btn-sm"
                        onclick="cambiarEstadoCliente(${c.id})">
                    <i class="bi bi-power"></i>
                </button>
            </td>
        </tr>`;
    });
    resaltarDesdeConsulta();

}

function abrirModalCliente() {

    ["cliId","cliNombre","cliTelefono","cliCorreo","cliDireccion"]
        .forEach(i => document.getElementById(i).value = "");

    document.getElementById("cliTitulo").textContent = "Nuevo Cliente";
    abrirModal("modalCliente");
}

function editarCliente(id) {

    const c = arrCli.find(x => x.id === id);
    if (!c) return alertaError("Cliente no encontrado");

    cliId.value        = c.id;
    cliNombre.value    = c.nombre;
    cliTelefono.value  = c.telefono || "";
    cliCorreo.value    = c.correo || "";
    cliDireccion.value = c.direccion || "";
    cliRFC.value   = c.rfc || "";
    cliRazon.value = c.razonSocial || "";
    cliUso.value   = c.usoCfdi || "P01";

    cliTitulo.textContent = "Editar Cliente";
    abrirModal("modalCliente");
}

async function guardarCliente() {

    if (!cliNombre.value.trim())
        return alertaWarning("El nombre del cliente es obligatorio");

    const id = cliId.value;

    const data = {
    nombre: cliNombre.value.trim(),
    telefono: cliTelefono.value.trim(),
    correo: cliCorreo.value.trim(),
    direccion: cliDireccion.value.trim(),
    rfc: cliRFC.value.trim(),
    razonSocial: cliRazon.value.trim(),
    usoCfdi: cliUso.value,
    estado: id
        ? arrCli.find(c => c.id == id)?.estado || "ACTIVO"
        : "ACTIVO"
};


    const url = id ? `/api/clientes/${id}` : "/api/clientes";
    const method = id ? "PUT" : "POST";

    try {
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        cerrarModal("modalCliente");
        cargarTodo();
        alertaExito("Cliente guardado correctamente");

    } catch {
        alertaError("No se pudo guardar el cliente");
    }
}

function cambiarEstadoCliente(id) {

    alertaConfirmacion(
        "Cambiar estado",
        "¿Deseas cambiar el estado del cliente?",
        async () => {
            try {
                await fetch(`/api/clientes/estado/${id}`, { method: "PUT" });
                cargarTodo();
                alertaInfo("Estado del cliente actualizado");
            } catch {
                alertaError("No se pudo cambiar el estado");
            }
        }
    );
}

function buscarClientes() {

    const t = filtroTexto.value.trim();
    const e = filtroEstado.value;

    let url = "/api/clientes/buscar?";
    if (t) url += `texto=${encodeURIComponent(t)}&`;
    if (e) url += `estado=${e}`;

    fetch(url)
        .then(r => r.json())
        .then(d => {
            arrCli = d;
            pintar();
            cerrarModal("modalBuscarClientes");
        })
        .catch(() => alertaError("No se pudo realizar la búsqueda"));
}

async function cargarReporteClientes() {

    try {
        const d = await ajaxGET("/api/clientes/reporte");

        repCliTotal.textContent    = d.total ?? 0;
        repCliActivos.textContent  = d.activos ?? 0;
        repCliInactivos.textContent= d.inactivos ?? 0;
        repCliMes.textContent      = d.nuevosMes ?? 0;

        abrirModal("modalReporteClientes");

    } catch {
        alertaError("No se pudo cargar el reporte");
    }
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

/* Helpers */
const alertaInfo    = m => alerta("info",    "Información", m);
const alertaExito   = m => alerta("success", "Éxito", m);
const alertaError   = m => alerta("error",   "Error", m);
const alertaWarning = m => alerta("warning", "Atención", m);

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

    setTimeout(() => {
        const fila = document.querySelector(
            `#tablaClientes tbody tr[data-id="${id}"]`
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

