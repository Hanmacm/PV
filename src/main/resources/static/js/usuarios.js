let usrs = [];

document.addEventListener("DOMContentLoaded", () => {
    loadUsrs();
});

function loadUsrs() {
    fetch("/usuarios/listar")
        .then(r => r.json())
        .then(d => drawUsrs(d))
        .catch(() => alert("Error al cargar usuarios"));
}

function drawUsrs(lst) {
    const tb = document.querySelector("#tablaUsuarios tbody");
    tb.innerHTML = "";

    if (!lst || lst.length === 0) {
        tb.innerHTML = `<tr><td colspan="6">Sin usuarios registrados.</td></tr>`;
        return;
    }

    usrs = lst;

    lst.forEach(u => {
        tb.innerHTML += `
            <tr>
                <td>${u.user}</td>
                <td>${u.nombre}</td>
                <td>${u.rol}</td>
                <td>${u.telefono}</td>
                <td>${u.correo}</td>
                <td>
                    <button onclick="editUsr(${u.id})" class="btn btn-primary btn-sm">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="delUsr(${u.id})" class="btn btn-danger btn-sm">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function openUsr() {
    clrUsr();
    usuTitulo.textContent = "Nuevo Usuario";
    modalUsuario.style.display = "flex";
}

function clrUsr() {
    usuId.value = "";
    userUsuario.value = "";
    passUsuario.value = "";
    nombreUsuario.value = "";
    rolUsuario.value = "usuario";
    telefonoUsuario.value = "";
    correoUsuario.value = "";
}

function closeUsr(id) {
    document.getElementById(id).style.display = "none";
}

function saveUsr() {
    const id = usuId.value;

    const u = {
        user: userUsuario.value,
        pass: passUsuario.value,
        nombre: nombreUsuario.value,
        rol: rolUsuario.value,
        telefono: telefonoUsuario.value,
        correo: correoUsuario.value
    };

    let url = "/usuarios/guardar";
    let m = "POST";

    if (id) {
        url = `/usuarios/actualizar/${id}`;
        m = "PUT";
    }

    fetch(url, {
        method: m,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u)
    })
        .then(r => r.json())
        .then(() => {
            closeUsr("modalUsuario");
            loadUsrs();
        })
        .catch(() => alert("Error al guardar usuario"));
}

function editUsr(id) {
    const u = usrs.find(x => x.id === id);
    if (!u) return;

    usuTitulo.textContent = "Editar Usuario";

    usuId.value = u.id;
    userUsuario.value = u.user;
    passUsuario.value = u.pass;
    nombreUsuario.value = u.nombre;
    rolUsuario.value = u.rol;
    telefonoUsuario.value = u.telefono;
    correoUsuario.value = u.correo;

    modalUsuario.style.display = "flex";
}

function delUsr(id) {
    if (!confirm("¿Eliminar este usuario?")) return;

    fetch(`/usuarios/eliminar/${id}`, { method: "DELETE" })
        .then(() => loadUsrs())
        .catch(() => alert("Error al eliminar usuario"));
}

function buscarUsuarios() {
    const t = filtroTexto.value;
    const r = filtroRol.value;

    fetch(`/usuarios/buscar?texto=${encodeURIComponent(t)}&rol=${r}`)
        .then(res => res.json())
        .then(d => drawUsrs(d))
        .catch(() => alert("Error en la búsqueda"));
}

function limpiarBusqueda() {
    filtroTexto.value = "";
    filtroRol.value = "";
    loadUsrs();
}
function abrirModalUsuario() {
    openUsr();
}

function guardarUsuario() {
    saveUsr();
}

function buscarUsuariosDesdeModal() {
    const t = document.getElementById("busUsuTexto").value;
    const r = document.getElementById("busUsuRol").value;

    fetch(`/usuarios/buscar?texto=${encodeURIComponent(t)}&rol=${r}`)
        .then(res => res.json())
        .then(d => drawUsrs(d))
        .catch(() => alert("Error en la búsqueda"));
}


function buscarUsuariosRolSolo() {
  const r = document.getElementById("busUsuRolSolo")?.value ?? "";
  document.getElementById("filtroTexto").value = "";
  document.getElementById("filtroRol").value = r;

  buscarUsuarios();
}

function verTodosUsuarios() {

  document.getElementById("filtroTexto").value = "";
  document.getElementById("filtroRol").value = "";

  if (typeof cargarUsuarios === "function") cargarUsuarios();
  else if (typeof buscarUsuarios === "function") buscarUsuarios();
}

