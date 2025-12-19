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
    }
}

function drawProv() {
    const tb = document.querySelector("#tablaProveedores tbody");
    if (!tb) return;

    tb.innerHTML = "";

    if (!provLst || provLst.length === 0) {
        tb.innerHTML = `<tr><td colspan="7">Sin proveedores aún.</td></tr>`;
        return;
    }

    provLst.forEach(p => {

        const st = p.activo === 1
            ? `<span class="badge badge-success">Activo</span>`
            : `<span class="badge badge-danger">Inactivo</span>`;

        const btns = p.activo === 1
            ? `
                <button onclick="editarProveedor(${p.id})" class="btn btn-primary btn-sm">
                    <i class="bi bi-pencil"></i>
                </button>
                <button onclick="eliminarProveedor(${p.id})" class="btn btn-danger btn-sm">
                    <i class="bi bi-x-circle"></i>
                </button>
              `
            : `
                <button onclick="activarProveedor(${p.id})" class="btn btn-success btn-sm">
                    <i class="bi bi-check-circle"></i>
                </button>
              `;

        tb.innerHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.empresa ?? ""}</td>
                <td>${p.telefono ?? ""}</td>
                <td>${p.correo ?? ""}</td>
                <td>${p.direccion ?? ""}</td>
                <td>${st}</td>
                <td>${btns}</td>
            </tr>
        `;
    });
}

function openProv() {
    provId.value = "";
    provNombre.value = "";
    provEmpresa.value = "";
    provTelefono.value = "";
    provCorreo.value = "";
    provDireccion.value = "";
    provTitulo.innerText = "Nuevo proveedor";
    modalProveedor.style.display = "flex";
}

function editProv(id) {
    const p = provLst.find(x => x.id === id);
    if (!p) return;

    provId.value = p.id;
    provNombre.value = p.nombre;
    provEmpresa.value = p.empresa ?? "";
    provTelefono.value = p.telefono ?? "";
    provCorreo.value = p.correo ?? "";
    provDireccion.value = p.direccion ?? "";

    provTitulo.innerText = "Editar proveedor";
    modalProveedor.style.display = "flex";
}

function closeM(id) {
    document.getElementById(id).style.display = "none";
}

async function saveProv() {
    const id = provId.value;

    const p = {
        nombre: provNombre.value,
        empresa: provEmpresa.value,
        telefono: provTelefono.value,
        correo: provCorreo.value,
        direccion: provDireccion.value
    };

    if (!p.nombre) { alert("El nombre es obligatorio"); return; }
    if (p.correo && !p.correo.includes("@")) { alert("Correo inválido"); return; }

    const m = id ? "PUT" : "POST";
    const url = id ? `/api/proveedores/${id}` : "/api/proveedores";

    await fetch(url, {
        method: m,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
    });

    closeM("modalProveedor");
    loadProv();
}

async function offProv(id) {
    if (!confirm("¿Desactivar proveedor?")) return;

    const r = await fetch(`/api/proveedores/${id}`, { method: "DELETE" });

    if (!r.ok) {
        const t = await r.text();
        alert(t);
        return;
    }

    loadProv();
}

async function onProv(id) {
    await fetch(`/api/proveedores/activar/${id}`, { method: "PUT" });
    loadProv();
}

async function findProv() {
    const t = filtroTexto.value;
    const e = filtroEstado.value;

    const url = `/api/proveedores/buscar?texto=${encodeURIComponent(t)}&estado=${e}`;

    const r = await fetch(url);
    provLst = await r.json();
    drawProv();
}

function clrFind() {
    filtroTexto.value = "";
    filtroEstado.value = "";
    loadProv();
}

function xlsProv() {
    window.open("/api/proveedores/reporte", "_blank");
}
function abrirModalProveedor(){ openProv(); }
function editarProveedor(id){ editProv(id); }
function cerrarModal(id){ closeM(id); }
function guardarProveedor(){ return saveProv(); }
function eliminarProveedor(id){ return offProv(id); }
function activarProveedor(id){ return onProv(id); }
function buscarProveedores(){ return findProv(); }
function limpiarBusqueda(){ clrFind(); }
function reporteProveedores(){ xlsProv(); }
function cargarProveedores(){ return loadProv(); }
function renderProveedores(){ drawProv(); }
