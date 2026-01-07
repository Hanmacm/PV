let usrMem = localStorage.getItem("recordarme") === "true";
let usrSave = localStorage.getItem("usuarioRecordado");

document.addEventListener("DOMContentLoaded", () => {
    if (usrMem && usrSave) {
        loginUser.value = usrSave;
        loginRecordarme.checked = true;
    }
});

async function iniciar() {
    const u = loginUser.value.trim();
    const p = loginPass.value.trim();
    const rec = loginRecordarme.checked;

    hideErr();

    if (!u || !p) {
        showErr("Faltan datos para iniciar sesión");
        return;
    }

    try {
        const r = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: u, pass: p })
        });

        const res = await r.json();

        if (!res.ok) {
            showErr(res.mensaje || "No se pudo iniciar sesión");
            return;
        }

        localStorage.setItem("usuario", JSON.stringify(res.usuario));

        if (rec) {
            localStorage.setItem("recordarme", "true");
            localStorage.setItem("usuarioRecordado", u);
        } else {
            localStorage.removeItem("recordarme");
            localStorage.removeItem("usuarioRecordado");
        }

        window.location.href = "/inicio";

    } catch (e) {
        showErr("No se pudo conectar con el servidor");
    }
}

function showErr(t) {
    msgError.textContent = t;
    msgError.style.display = "block";
    msgError.style.animation = "shake .3s";
}

function hideErr() {
    msgError.style.display = "none";
}

function abrirModal() {
    modalRecuperar.style.display = "flex";
}

function cerrarModal() {
    modalRecuperar.style.display = "none";
}

async function recuperarPass() {
    const u = recUser.value.trim();

    if (!u) {
        mostrarAlerta("Escribe tu usuario para continuar");

        return;
    }

    try {
        const r = await fetch("/api/login/recuperar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: u })
        });

        const res = await r.json();
       mostrarAlerta(res.mensaje, "Recuperación de contraseña");

        cerrarModal();

    } catch {
        mostrarAlerta("No se pudo completar la solicitud", "Error");

    }
}

document.addEventListener("keydown", e => {
    if (e.key === "Enter") iniciar();
});

document.head.insertAdjacentHTML("beforeend", `
<style>
@keyframes shake {
0%{transform:translateX(0)}
25%{transform:translateX(-4px)}
50%{transform:translateX(4px)}
75%{transform:translateX(-4px)}
100%{transform:translateX(0)}
}
</style>
`);
function mostrarAlerta(msg, titulo = "Aviso") {
    alertTitulo.textContent = titulo;
    alertMensaje.textContent = msg;
    modalAlerta.style.display = "flex";
}

function cerrarAlerta() {
    modalAlerta.style.display = "none";
}
function togglePassword() {
    const pass = document.getElementById("loginPass");
    const icon = document.getElementById("togglePass");

    if (pass.type === "password") {
        pass.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    } else {
        pass.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    }
}
