let chMet = null;
let chTop = null;

document.addEventListener("DOMContentLoaded", () => {
    loadDash("hoy");
});

async function loadDash(f = "hoy") {
    setLoad(true);

    try {
        const r = await fetch(`/api/inicio/dashboard?filtro=${f}`);
        if (!r.ok) throw "err";

        const d = await r.json() || {};

        setKPIs(d);
        setLast(d);
        setStock(d);
        setCaja(d);
        charts(d);

    } catch {
        dashErr("No se pudo cargar el dashboard");
    } finally {
        setLoad(false);
    }
}

function filtrarDash(f) {
    loadDash(f);
}

function setKPIs(d) {
    k("kpi-ventas-dia", money(d.ventasDia));
    k("kpi-tickets-dia", d.ticketsDia ?? 0);
    k("kpi-ticket-promedio", money(d.ticketPromedio));
}

function setLast(d) {
    const tb = q("#tablaUltimasVentas tbody");
    tb.innerHTML = "";

    const l = d.ultimasVentas || [];
    if (!l.length) {
        tb.innerHTML = `<tr><td colspan="6">Sin ventas recientes</td></tr>`;
        return;
    }

    l.forEach(v => {
        tb.innerHTML += `
        <tr>
            <td>${v.id}</td>
            <td>${fmt(v.fecha)}</td>
            <td>${v.cliente || "-"}</td>
            <td>${v.metodo || "-"}</td>
            <td>${money(v.total)}</td>
            <td>${v.estado}</td>
        </tr>`;
    });
}

function setStock(d) {
    const ul = q("#listaInventarioBajo");
    ul.innerHTML = "";

    const l = d.productosBajoInventario || [];
    if (!l.length) {
        ul.innerHTML = "<li>Inventario estable</li>";
        return;
    }

    l.forEach(p =>
        ul.innerHTML += `<li>${p.nombre} (${p.existencia})</li>`
    );
}

function setCaja(d) {
    const bx = q("#alertCajaInicio");

    if (d.cajaActual) {
        bx.textContent = `Caja #${d.cajaActual.id} · ${money(d.cajaActual.montoInicial)}`;
        bx.className = "alert-caja alert-open";
    } else {
        bx.textContent = "No hay caja abierta";
        bx.className = "alert-caja alert-closed";
    }
}

function charts(d) {

    if (chMet) chMet.destroy();
    if (chTop) chTop.destroy();

    if (d.ventasPorMetodo?.length) {
        chMet = new Chart(q("#miniMetodos"), {
            type: "pie",
            data: {
                labels: d.ventasPorMetodo.map(x => x.metodo),
                datasets: [{ data: d.ventasPorMetodo.map(x => x.total) }]
            }
        });
    }

    if (d.topProductos?.length) {
        chTop = new Chart(q("#miniTop"), {
            type: "bar",
            data: {
                labels: d.topProductos.map(x => x.nombre),
                datasets: [{ data: d.topProductos.map(x => x.cantidad) }]
            },
            options: { indexAxis: "y", plugins: { legend: { display: false } } }
        });
    }
}

const q = s => document.querySelector(s);
const k = (i, v) => document.getElementById(i).textContent = v;

const fmt = f => f ? f.replace("T"," ").substring(0,16) : "";

const money = n =>
    typeof formatoMoneda === "function"
        ? formatoMoneda(n || 0)
        : Number(n || 0).toLocaleString("es-MX",{style:"currency",currency:"MXN"});

function setLoad(on) {
    document.querySelector("main.content")?.classList.toggle("is-loading", on);
}

function dashErr(t) {
    q("#tablaUltimasVentas tbody").innerHTML =
        `<tr><td colspan="6">${t}</td></tr>`;
}
