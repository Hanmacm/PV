document.addEventListener("DOMContentLoaded", () => {
    loadTot()
    loadMes()
    loadTop()
    loadComparativa()
})
let charts = {}

async function loadTot(desde = null, hasta = null) {

    let url = "/api/estadisticas/totales"
    if (desde && hasta) {
        url += `?desde=${desde}&hasta=${hasta}`
    }

    const r = await fetch(url)
    const d = await r.json()

    document.getElementById("kpiVentas").textContent =
        "$" + Number(d.v || 0).toFixed(2)

    document.getElementById("kpiCompras").textContent =
        "$" + Number(d.c || 0).toFixed(2)

    document.getElementById("kpiGanancias").textContent =
        "$" + Number(d.g || 0).toFixed(2)
}

async function loadMes(desde = null, hasta = null) {

    let url = "/api/estadisticas/mensual"
    if (desde && hasta) {
        url += `?desde=${desde}&hasta=${hasta}`
    }

    const r = await fetch(url)
    const d = await r.json()

    mkChart("chartVentasMes", d.vm, "Ventas")
    mkChart("chartComprasMes", d.cm, "Compras")
    mkChart("chartGananciasMes", d.gm, "Ganancias")
}

async function loadTop() {
    const r = await fetch("/api/estadisticas/top-productos")
    const d = await r.json()

    mkChart("chartTopProductos", d.q, "Productos", d.n)
}

async function loadComparativa() {

    const r = await fetch("/api/estadisticas/comparativa")
    const d = await r.json()

    pintarComparativa("cmpVentas", d.v)
    pintarComparativa("cmpCompras", d.c)
    pintarComparativa("cmpGanancias", d.g)
}

function pintarComparativa(id, valor) {

    const el = document.getElementById(id)
    if (!el) return

    const num = Number(valor || 0)
    const icon = num >= 0 ? "▲" : "▼"
    const color = num >= 0 ? "#16a34a" : "#dc2626"

    el.textContent = `${icon} ${Math.abs(num).toFixed(1)}%`
    el.style.color = color
}

async function filtrarEstadisticas() {

    const d = estDesde.value
    const h = estHasta.value

    if (!d || !h) {
        return alertaWarning("Selecciona un rango de fechas")
    }

    await loadTot(d, h)
    await loadMes(d, h)
}

function mkChart(id, data, lbl, labels = null) {

    const ctx = document.getElementById(id)
    if (!ctx) return

    // 🔥 destruir chart previo si existe
    if (charts[id]) {
        charts[id].destroy()
    }

    charts[id] = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels || ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
            datasets: [{
                label: lbl,
                data: data || [],
                backgroundColor: "rgba(54,162,235,.75)"
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    })
}

