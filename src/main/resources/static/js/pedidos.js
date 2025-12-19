let pedLst = [];
let cliLst = [];
let prodLst = [];
let detLst = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadCli();
    await loadProd();
    await loadPed();
});

async function loadCli() {
    const r = await fetch("/api/clientes");
    cliLst = (await r.json()).filter(x => x.estado === "ACTIVO");
    const s = document.getElementById("pedCliente");
    s.innerHTML = "";
    cliLst.forEach(c => s.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
}

async function loadProd() {
    const r = await fetch("/api/productos/activos");
    prodLst = await r.json();
    const s = document.getElementById("pedProducto");
    s.innerHTML = "";
    prodLst.forEach(p => s.innerHTML += `<option value="${p.id}">${p.nombre} - $${p.precio}</option>`);
}

function abrirModalPedido() {
    detLst = [];
    document.getElementById("pedNotas").value = "";
    updDet();
    updTot();
    abrirModal("modalPedido");
}

function agregarProductoPedido() {
    const id = +pedProducto.value;
    const c = +pedCantidad.value;
    if (!id || c <= 0) return alert("Selecciona un producto y una cantidad válida");
    const p = prodLst.find(x => x.id === id);
    if (!p) return;
    detLst.push({
        productoId: p.id,
        nombre: p.nombre,
        cantidad: c,
        precio: p.precio,
        subtotal: p.precio * c
    });
    updDet();
    updTot();
}

function eliminarItemDetalle(i) {
    detLst.splice(i, 1);
    updDet();
    updTot();
}

function updDet() {
    const tb = document.querySelector("#tablaDetallePedido tbody");
    tb.innerHTML = "";
    detLst.forEach((d, i) => {
        tb.innerHTML += `
        <tr>
            <td>${d.nombre}</td>
            <td>${d.cantidad}</td>
            <td>$${d.precio.toFixed(2)}</td>
            <td>$${d.subtotal.toFixed(2)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="eliminarItemDetalle(${i})">&times;</button></td>
        </tr>`;
    });
}

function updTot() {
    const t = detLst.reduce((a, b) => a + b.subtotal, 0);
    pedTotal.textContent = t.toFixed(2);
    return t;
}

async function guardarPedido() {
    if (!pedCliente.value) return alert("Selecciona un cliente");
    if (detLst.length === 0) return alert("Agrega al menos un producto");

    try {
        await fetch("/api/pedidos/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clienteId: +pedCliente.value,
                estado: pedEstado.value,
                direccion: pedNotas.value,
                detalles: detLst.map(d => ({
                    productoId: d.productoId,
                    cantidad: d.cantidad
                }))
            })
        });

        cerrarModal("modalPedido");
        loadPed();
        alert("Pedido registrado correctamente");

    } catch {
        alert("No se pudo guardar el pedido, intenta de nuevo");
    }
}

async function loadPed() {
    pedLst = await ajaxGET("/api/pedidos/listar");
    drawPed();
}

function drawPed() {
    const tb = document.querySelector("#tablaPedidos tbody");
    tb.innerHTML = "";
    if (!pedLst.length) {
        tb.innerHTML = `<tr><td colspan="7">No hay pedidos registrados</td></tr>`;
        return;
    }

    pedLst.forEach(p => {
        tb.innerHTML += `
        <tr>
            <td>${p.id}</td>
            <td>${p.cliente?.nombre || "-"}</td>
            <td>${p.fecha?.replace("T"," ").substring(0,16)}</td>
            <td><span class="badge">${p.estado}</span></td>
            <td>${p.direccionEntrega || ""}</td>
            <td>$${(p.total||0).toFixed(2)}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="convertirPedido(${p.id})">
                    <i class="bi bi-arrow-left-right"></i>
                </button>
                <button class="btn btn-info btn-sm" onclick="verDetallePedido(${p.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="cancelarPedido(${p.id})">
                    <i class="bi bi-x-circle"></i>
                </button>
            </td>
        </tr>`;
    });
}

async function convertirPedido(id) {
    if (!confirm("¿Deseas convertir este pedido en venta?")) return;
    const r = await fetch(`/api/pedidos/convertir/${id}`, { method:"POST" });
    if (!r.ok) return alert(await r.text());
    alert("Pedido convertido correctamente");
    loadPed();
}

async function cancelarPedido(id) {
    if (!confirm("¿Cancelar este pedido?")) return;
    await fetch(`/api/pedidos/estado/${id}?estado=Cancelado`, { method:"PUT" });
    alert("Pedido cancelado");
    loadPed();
}
