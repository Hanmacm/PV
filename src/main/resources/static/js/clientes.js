let arrCli = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarTodo();
});

async function cargarTodo() {
    try {
        const r = await fetch("/api/clientes");
        arrCli = await r.json();
        pintar();
    } catch {
        arrCli = [];
        pintar();
    }
}

function pintar() {
    const tb = document.querySelector("#tablaClientes tbody");
    tb.innerHTML = "";

    if (!arrCli.length) {
        tb.innerHTML = "<tr><td colspan='6'>Sin datos</td></tr>";
        return;
    }

    arrCli.forEach(x => {
        tb.innerHTML += `
            <tr>
                <td>${x.nombre}</td>
                <td>${x.telefono || ""}</td>
                <td>${x.correo || ""}</td>
                <td>${x.direccion || ""}</td>
                <td>
                    <span class="badge ${x.estado === "ACTIVO" ? "badge-success" : "badge-secondary"}">
                        ${x.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="edit(${x.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="toggle(${x.id})">
                        <i class="bi bi-power"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function abrirModalCliente() {
    ["cliId","cliNombre","cliTelefono","cliCorreo","cliDireccion"]
        .forEach(id => document.getElementById(id).value = "");
    document.getElementById("cliTitulo").innerText = "Nuevo Cliente";
    document.getElementById("modalCliente").style.display = "flex";
}

function edit(id) {
    const c = arrCli.find(e => e.id === id);
    if (!c) return;

    cliId.value = c.id;
    cliNombre.value = c.nombre;
    cliTelefono.value = c.telefono || "";
    cliCorreo.value = c.correo || "";
    cliDireccion.value = c.direccion || "";

    cliTitulo.innerText = "Editar Cliente";
    modalCliente.style.display = "flex";
}

async function guardarCliente() {
    const id = cliId.value;

    const obj = {
        nombre: cliNombre.value,
        telefono: cliTelefono.value,
        correo: cliCorreo.value,
        direccion: cliDireccion.value
    };

    const m = id ? "PUT" : "POST";
    const u = id ? `/api/clientes/${id}` : "/api/clientes";

    await fetch(u, {
        method: m,
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(obj)
    });

    cerrarModal("modalCliente");
    cargarTodo();
}

async function toggle(id) {
    if (!confirm("Cambiar estado del cliente")) return;
    await fetch(`/api/clientes/estado/${id}`, {method:"PUT"});
    cargarTodo();
}

function buscarClientes() {
    const t = filtroTexto.value;
    const e = filtroEstado.value;

    let u = "/api/clientes/buscar?";
    if (t) u += `texto=${encodeURIComponent(t)}&`;
    if (e) u += `estado=${e}`;

    fetch(u)
        .then(r => r.json())
        .then(d => {
            arrCli = d;
            pintar();
        });
}

async function cargarReporteClientes() {
    const r = await fetch("/api/clientes/reporte");
    const d = await r.json();

    repCliTotal.textContent = d.total;
    repCliActivos.textContent = d.activos;
    repCliInactivos.textContent = d.inactivos;
    repCliMes.textContent = d.nuevosMes;

    abrirModal("modalReporteClientes");
}
