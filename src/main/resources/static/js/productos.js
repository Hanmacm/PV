let prodLst = [];

document.addEventListener("DOMContentLoaded", async () => {
    await cargarProductos();
    alertarStockBajo();
});

async function cargarProductos() {
    try {
        prodLst = await ajaxGET("/api/productos");
        dibujarProductos();
    } catch {
        alertaError("No se pudieron cargar los productos");
    }
}

function dibujarProductos() {
    const tb = document.querySelector("#tablaProductos tbody");
    tb.innerHTML = "";

    if (!prodLst.length) {
        tb.innerHTML = `<tr><td colspan="7">Sin productos registrados</td></tr>`;
        return;
    }

    prodLst.forEach(p => {
        tb.innerHTML += `
        <tr data-id="${p.id}">
            <td>${p.nombre}</td>
            <td>${p.categoria ?? "-"}</td>
            <td>$${Number(p.precio).toFixed(2)}</td>
            <td>
                <span class="badge ${
                    p.stock <= 5 ? "danger" :
                    p.estado === "ACTIVO" ? "success" : "secondary"
                }">${p.stock}</span>
            </td>
            <td>${p.codigo ?? "-"}</td>
            <td>
                <span class="badge ${
                    p.estado === "ACTIVO" ? "success" : "secondary"
                }">${p.estado}</span>
            </td>
            <td>
                <button class="btn btn-primary btn-sm"
                    onclick="editarProducto(${p.id})">
                    <i class="bi bi-pencil"></i>
                </button>

                <button class="btn btn-warning btn-sm"
                    onclick="cambiarEstadoProducto(${p.id})">
                    <i class="bi bi-power"></i>
                </button>
            </td>
        </tr>`;
    });
    resaltarDesdeConsulta();

}

function abrirModalProducto() {
    prodId.value = "";
    prodNombre.value = "";
    prodCategoria.value = "";
    prodPrecio.value = "";
    prodStock.value = "";
    prodCodigo.value = "";
    prodDescripcion.value = "";
    prodTitulo.textContent = "Nuevo Producto";
    abrirModal("modalProducto");
}

async function editarProducto(id) {
    try {
        const p = await ajaxGET(`/api/productos/${id}`);

        prodId.value = p.id;
        prodNombre.value = p.nombre;
        prodCategoria.value = p.categoria;
        prodPrecio.value = p.precio;
        prodStock.value = p.stock;
        prodCodigo.value = p.codigo;
        prodDescripcion.value = p.descripcion;
        prodTitulo.textContent = "Editar Producto";

        abrirModal("modalProducto");
    } catch {
        alertaError("No se pudo cargar el producto");
    }
}

async function guardarProducto() {

    if (!prodNombre.value || !prodPrecio.value) {
        return alertaWarning("Nombre y precio son obligatorios");
    }

    const body = {
        id: prodId.value || null,
        nombre: prodNombre.value,
        categoria: prodCategoria.value,
        precio: Number(prodPrecio.value),
        stock: Number(prodStock.value),
        codigo: prodCodigo.value,
        descripcion: prodDescripcion.value,
        estado: "ACTIVO"
    };

    try {
        await fetch("/api/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        cerrarModal("modalProducto");
        cargarProductos();
        alertaExito("Producto guardado correctamente");

    } catch {
        alertaError("No se pudo guardar el producto");
    }
}

function cambiarEstadoProducto(id) {

    alertaConfirmacion(
        "Cambiar estado",
        "¿Deseas cambiar el estado del producto?",
        async () => {
            try {
                await fetch(`/api/productos/estado/${id}`, { method: "PUT" });
                cargarProductos();
                alertaInfo("Estado del producto actualizado");
            } catch {
                alertaError("No se pudo cambiar el estado");
            }
        }
    );
}

async function buscarProductos() {

    const t = filtroTexto.value;
    const e = filtroEstado.value;

    let url = "/api/productos/buscar?";
    if (t) url += `texto=${encodeURIComponent(t)}&`;
    if (e) url += `estado=${e}`;

    try {
        prodLst = await ajaxGET(url);
        dibujarProductos();
    } catch {
        alertaError("No se pudo realizar la búsqueda");
    }
}

async function cargarReporteProductos() {
    try {
        const d = await ajaxGET("/api/productos/reporte");

        repTotalProductos.textContent  = d.totalProductos ?? 0;
        repActivos.textContent         = d.productosActivos ?? 0;
        repInactivos.textContent       = d.productosInactivos ?? 0;
        repStockBajo.textContent       = d.productosStockBajo ?? 0;
        repValorInventario.textContent =
            `$${Number(d.valorInventario ?? 0).toFixed(2)}`;

        abrirModal("modalReporteProductos");

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
function abrirModalBuscarProductos() {
    filtroTexto.value = "";
    filtroEstado.value = "";
    abrirModal("modalBuscarProductos");
}

async function buscarProductosModal() {
    await buscarProductos();
    cerrarModal("modalBuscarProductos");
}
async function alertarStockBajo() {
    try {
        const bajos = await ajaxGET("/api/productos/alertas");

        if (!bajos || !bajos.length) return;

        let mensaje = "Los siguientes productos tienen stock bajo:\n\n";

        bajos.forEach(p => {
            mensaje += `• ${p.nombre} (Stock: ${p.existencia})\n`;
        });

        alertaWarning(mensaje);

    } catch (e) {
        console.error("Error verificando stock bajo", e);
    }
}
function resaltarDesdeConsulta() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("resaltar");
    if (!id) return;

    setTimeout(() => {
        const fila = document.querySelector(
            `#tablaProductos tbody tr[data-id="${id}"]`
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
