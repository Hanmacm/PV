let provLst = [];

document.addEventListener("DOMContentLoaded", () => {
    loadProv();
});

async function loadProv() {
    try {
        const r = await fetch("/api/proveedores");
        provLst = await r.json();
        drawProv();
    } catch (e) {
        console.error(e);
        alertaError("No se pudieron cargar los proveedores");
    }
}

function drawProv() {
    const tb = document.querySelector("#tablaProveedores tbody");
    if (!tb) return;

    tb.innerHTML = "";

    if (!provLst || provLst.length === 0) {
        tb.innerHTML = `<tr><td colspan="7">Sin proveedores registrados</td></tr>`;
        return;
    }

    provLst.forEach(p => {

        const estado = p.activo === 1
            ? `<span class="badge badge-success">Activo</span>`
            : `<span class="badge badge-danger">Inactivo</span>`;

        const acciones = p.activo === 1
            ? `
                <button class="btn btn-primary btn-sm" onclick="editarProveedor(${p.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProveedor(${p.id})">
                    <i class="bi bi-x-circle"></i>
                </button>
              `
            : `
                <button class="btn btn-success btn-sm" onclick="activarProveedor(${p.id})">
                    <i class="bi bi-check-circle"></i>
                </button>
              `;

        tb.innerHTML += `
            <tr data-id="${p.id}">
                <td>${p.nombre}</td>
                <td>${p.empresa ?? ""}</td>
                <td>${p.telefono ?? ""}</td>
                <td>${p.correo ?? ""}</td>
                <td>${p.direccion ?? ""}</td>
                <td>${estado}</td>
                <td>${acciones}</td>
            </tr>
        `;
    });
    resaltarDesdeConsulta();

}

function abrirModalProveedor() {
    provId.value = "";
    provNombre.value = "";
    provEmpresa.value = "";
    provTelefono.value = "";
    provCorreo.value = "";
    provDireccion.value = "";
    provTitulo.textContent = "Nuevo proveedor";
    abrirModal("modalProveedor");
}

function editarProveedor(id) {
    const p = provLst.find(x => x.id === id);
    if (!p) return alertaError("Proveedor no encontrado");

    provId.value = p.id;
    provNombre.value = p.nombre;
    provEmpresa.value = p.empresa ?? "";
    provTelefono.value = p.telefono ?? "";
    provCorreo.value = p.correo ?? "";
    provDireccion.value = p.direccion ?? "";

    provTitulo.textContent = "Editar proveedor";
    abrirModal("modalProveedor");
}

async function guardarProveedor() {

    const id = provId.value;

    const data = {
        nombre: provNombre.value.trim(),
        empresa: provEmpresa.value.trim(),
        telefono: provTelefono.value.trim(),
        correo: provCorreo.value.trim(),
        direccion: provDireccion.value.trim()
    };

    if (!data.nombre)
        return alertaWarning("El nombre del proveedor es obligatorio");

    if (data.correo && !data.correo.includes("@"))
        return alertaWarning("Correo inválido");

    try {

        const url = id
            ? `/api/proveedores/${id}`
            : `/api/proveedores`;

        const method = id ? "PUT" : "POST";

        const r = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!r.ok) {
            const t = await r.text();
            return alertaError(t || "No se pudo guardar el proveedor");
        }

        cerrarModal("modalProveedor");
        await loadProv();

        alertaExito(
            id
                ? "Proveedor actualizado correctamente"
                : "Proveedor registrado correctamente"
        );

    } catch (e) {
        console.error(e);
        alertaError("Error al guardar proveedor");
    }
}

function eliminarProveedor(id) {
    alertaConfirmacion(
        "Desactivar proveedor",
        "Esre proveedor será desactivado",
        async () => {
            try {
                const r = await fetch(`/api/proveedores/${id}`, { method: "DELETE" });
                if (!r.ok) {
                    const t = await r.text();
                    return alertaError(t || "No se pudo desactivar");
                }
                await loadProv();
                alertaWarning("Proveedor desactivado");
            } catch (e) {
                console.error(e);
                alertaError("Error al desactivar proveedor");
            }
        }
    );
}

async function activarProveedor(id) {
    try {
        const r = await fetch(`/api/proveedores/activar/${id}`, { method: "PUT" });
        if (!r.ok) {
            const t = await r.text();
            return alertaError(t || "No se pudo activar");
        }
        await loadProv();
        alertaExito("Proveedor activado correctamente");
    } catch (e) {
        console.error(e);
        alertaError("Error al activar proveedor");
    }
}

async function buscarProveedores() {
    const t = filtroTexto.value.trim();
    const e = filtroEstado.value;

    try {
        const r = await fetch(
            `/api/proveedores/buscar?texto=${encodeURIComponent(t)}&estado=${e}`
        );

        if (!r.ok) {
            throw new Error("Error en búsqueda");
        }

        provLst = await r.json();
        drawProv();

        cerrarModal("modalBuscarProveedor");

    } catch (err) {
        console.error(err);
        alertaError("No se pudo realizar la búsqueda");
    }
}

function reporteProveedores() {
    window.open("/api/proveedores/reporte", "_blank");
}

function alerta(tipo, titulo, mensaje) {

    const modal = document.getElementById("modalAlertModern");
    const box   = document.getElementById("alertBox");
    const icon  = document.getElementById("alertIcon");
    const title = document.getElementById("alertTitle");
    const msg   = document.getElementById("alertMessage");
    const btn   = document.querySelector("#modalAlertModern .alert-btn");

    if (!modal || !box || !icon || !title || !msg || !btn) {
        return alert(`${titulo}\n${mensaje}`);
    }

    box.className = `alert-box alert-${tipo}`;

    const icons = {
        info: "bi-info-circle",
        success: "bi-check-circle",
        warning: "bi-exclamation-triangle",
        error: "bi-x-circle"
    };

    icon.innerHTML = `<i class="bi ${icons[tipo] || icons.info}"></i>`;
    title.textContent = titulo;
    msg.textContent = mensaje;

    abrirModal("modalAlertModern");

    btn.onclick = () => cerrarModal("modalAlertModern");
}


const alertaInfo    = m => alerta("info", "Información", m);
const alertaExito   = m => alerta("success", "Éxito", m);
const alertaWarning = m => alerta("warning", "Atención", m);
const alertaError   = m => alerta("error", "Error", m);

function alertaConfirmacion(titulo, mensaje, onAceptar) {

    alerta("warning", titulo, mensaje);

    const btn = document.querySelector("#modalAlertModern .alert-btn");

    btn.onclick = () => {
        cerrarModal("modalAlertModern");
        if (typeof onAceptar === "function") onAceptar();
    };
}

function abrirModalBuscarProveedores() {
    abrirModal("modalBuscarProveedor");
}
function limpiarBusqueda() {
    const filtroTexto = document.getElementById("filtroTexto");
    const filtroEstado = document.getElementById("filtroEstado");

    if (filtroTexto) filtroTexto.value = "";
    if (filtroEstado) filtroEstado.value = "";

    loadProv();
    cerrarModal("modalBuscarProveedor");
}
function resaltarDesdeConsulta() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("resaltar");

    if (!id) return;

    const filas = document.querySelectorAll("#tablaProveedores tbody tr");

    filas.forEach(tr => {
        const nombre = tr.children[0]?.textContent?.trim();
        if (nombre && tr.dataset.id == id) {
            tr.classList.add("resaltado");
            tr.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    history.replaceState({}, document.title, location.pathname);
}

