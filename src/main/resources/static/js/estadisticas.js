document.addEventListener("DOMContentLoaded", () => {
    loadTot()
    loadMes()
    loadTop()
})

async function loadTot(){
    const r = await fetch("/api/estadisticas/totales")
    const d = await r.json()

    document.querySelector("#kpiVentas h2").textContent =
        "$" + d.v.toFixed(2)

    document.querySelector("#kpiCompras h2").textContent =
        "$" + d.c.toFixed(2)

    document.querySelector("#kpiGanancias h2").textContent =
        "$" + d.g.toFixed(2)
}

async function loadMes(){
    const r = await fetch("/api/estadisticas/mensual")
    const d = await r.json()

    mkChart("chartVentasMes", d.vm, "Ventas")
    mkChart("chartComprasMes", d.cm, "Compras")
    mkChart("chartGananciasMes", d.gm, "Ganancias")
}

async function loadTop(){
    const r = await fetch("/api/estadisticas/top-productos")
    const d = await r.json()

    mkChart("chartTopProductos", d.q, "Productos", d.n)
}

function mkChart(id, data, lbl, labels = null){
    new Chart(document.getElementById(id), {
        type: "bar",
        data: {
            labels: labels || ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
            datasets: [{
                label: lbl,
                data,
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
