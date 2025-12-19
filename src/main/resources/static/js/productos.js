let prodLst = [];

document.addEventListener("DOMContentLoaded", () => {
    loadProd();
    chkLow();
});

async function loadProd() {
    const r = await fetch("/api/productos");
    prodLst = await r.json();
    drawProd();
}

function drawProd() {
    const tb = document.querySelector("#tablaProductos tbody");
    tb.innerHTML = "";

    if (!prodLst.length) {
        tb.innerHTML = `<tr><td colspan="7">Sin productos aún.</td></tr>`;
        return;
    }

    prodLst.forEach(p => {
        tb.innerHTML += `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.categoria ?? "-"}</td>
            <td>${formatoMoneda(p.precio)}</td>
            <td>
                <span class="badge ${
                    p.stock <= 5 ? 'badge-danger' :
                    p.estado === 'ACTIVO' ? 'badge-success' : 'badge-secondary'
                }">${p.stock}</span>
            </td>
            <td>${p.codigo ?? "-"}</td>
            <td>
                <span class="badge ${
                    p.estado === 'ACTIVO' ? 'badge-success' : 'badge-secondary'
                }">${p.estado}</span>
            </td>
            <td>
                <button onclick="editarProducto(${p.id})" class="btn btn-primary btn-sm">
                    <i class="bi bi-pencil"></i>
                </button>
                <button onclick="cambiarEstadoProducto(${p.id})"
                        class="btn btn-warning btn-sm">
                    <i class="bi bi-power"></i>
                </button>
            </td>
        </tr>`;
    });
}

function openProd() {
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

async function editProd(id) {
    const r = await fetch(`/api/productos/${id}`);
    const p = await r.json();

    prodId.value = p.id;
    prodNombre.value = p.nombre;
    prodCategoria.value = p.categoria;
    prodPrecio.value = p.precio;
    prodStock.value = p.stock;
    prodCodigo.value = p.codigo;
    prodDescripcion.value = p.descripcion;
    prodTitulo.textContent = "Editar Producto";
    abrirModal("modalProducto");
}

async function saveProd() {
    const d = {
        id: prodId.value || null,
        nombre: prodNombre.value,
        categoria: prodCategoria.value,
        precio: Number(prodPrecio.value),
        stock: Number(prodStock.value),
        codigo: prodCodigo.value,
        descripcion: prodDescripcion.value,
        estado: "ACTIVO"
    };

    await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d)
    });

    cerrarModal("modalProducto");
    loadProd();
}

async function togProd(id) {
    if (!confirm("¿Cambiar estado del producto?")) return;
    await fetch(`/api/productos/estado/${id}`, { method: "PUT" });
    loadProd();
}

async function findProd() {
    const t = filtroTexto.value;
    const e = filtroEstado.value;

    let url = "/api/productos/buscar?";
    if (t) url += `texto=${encodeURIComponent(t)}&`;
    if (e) url += `estado=${e}`;

    const r = await fetch(url);
    prodLst = await r.json();
    drawProd();
}

async function chkLow() {
    const r = await fetch("/api/productos/alertas");
    const d = await r.json();
    if (!d.length) return;

    let m = "Productos con stock bajo:\n\n";
    d.forEach(x => m += `• ${x.nombre} (Stock: ${x.existencia})\n`);
    alert(m);
}

async function repProd() {
    const r = await fetch("/api/productos/reporte");
    const d = await r.json();

    repTotalProductos.textContent = d.totalProductos ?? 0;
    repActivos.textContent = d.productosActivos ?? 0;
    repInactivos.textContent = d.productosInactivos ?? 0;
    repStockBajo.textContent = d.productosStockBajo ?? 0;
    repValorInventario.textContent = formatoMoneda(d.valorInventario ?? 0);

    abrirModal("modalReporteProductos");
}

function cargarProductos(){ loadProd(); }
function renderProductos(){ drawProd(); }
function abrirModalProducto(){ openProd(); }
function editarProducto(id){ editProd(id); }
function guardarProducto(){ saveProd(); }
function cambiarEstadoProducto(id){ togProd(id); }
function buscarProductos(){ findProd(); }
function cargarReporteProductos(){ repProd(); }
