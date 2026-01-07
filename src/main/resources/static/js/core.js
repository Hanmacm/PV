document.addEventListener("DOMContentLoaded", () => {

    const raw = localStorage.getItem("usuario");
    if (!raw) return;

    try {
        const u = JSON.parse(raw);

        if (document.getElementById("brandUserName")) {
            brandUserName.textContent = u.nombre;
            brandUserRol.textContent = u.rol;
        }

        if (document.getElementById("welcomeMensaje")) {
            welcomeMensaje.textContent = `Bienvenido, ${u.nombre} 👋`;
            welcomeInfo.textContent = `Sesión iniciada como ${u.rol.toUpperCase()}.`;
        }

    } catch (e) {
        console.error("Usuario corrupto:", e);
    }
});

document.addEventListener("DOMContentLoaded", () => {

    if (location.pathname === "/login") return;

    const u = localStorage.getItem("usuario");

    if (!u) {
        sessionStorage.clear();
        localStorage.clear();
        location.replace("/login");
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const raw = localStorage.getItem("usuario");
    if (!raw) return;

    const u = JSON.parse(raw);
    const rol = (u.rol || "").toLowerCase();

    if (rol === "cajero") {
        hide("menuCompras");
        hide("menuProductos");
        hide("menuUsuarios");
        hide("menuProveedores");
        hide("menuReportes");
        hide("menuEstadisticas");
        hide("menuFacturacion");
        hide("menuConfig");
    }

    if (rol === "usuario") {
        hide("menuVentas");
        hide("menuCompras");
        hide("menuProductos");
        hide("menuUsuarios");
        hide("menuProveedores");
        hide("menuCajas");
        hide("menuReportes");
        hide("menuEstadisticas");
        hide("menuFacturacion");
        hide("menuConfig");
    }
});

function cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();

    history.pushState(null, null, location.href);
    window.onpopstate = () => history.go(1);

    location.href = "/login";
}

function hide(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function abrirModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = "flex";
}

function cerrarModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = "none";
}

function msg(t) {
    alert(t);
}

function confirmar(t) {
    return confirm(t);
}

function formatoMoneda(n) {
    return Number(n || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2
    });
}

async function ajaxGET(url) {
    try {
        const r = await fetch(url);

        if (r.status === 204) return null;

        const txt = await r.text();
        if (!txt) return null;

        return JSON.parse(txt);

    } catch (e) {
        console.error("GET error:", url, e);
        return null;
    }
}

async function ajaxPOST(url, data) {
    try {
        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await r.json();
    } catch (e) {
        console.error("POST error:", e);
        msg("No se pudo enviar la información.");
    }
}

function llenarSelect(id, arr, txt, val) {
    const sel = document.getElementById(id);
    sel.innerHTML = "";

    arr.forEach(x => {
        const op = document.createElement("option");
        op.textContent = x[txt];
        op.value = x[val];
        sel.appendChild(op);
    });
}


function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    let overlay = document.getElementById("sidebarOverlay");

    sidebar.classList.toggle("sidebar-collapsed");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "sidebarOverlay";
        overlay.className = "sidebar-overlay";
        overlay.onclick = toggleSidebar;
        document.body.appendChild(overlay);
    } else {
        overlay.remove();
    }
}
