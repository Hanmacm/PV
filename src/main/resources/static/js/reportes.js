async function genRep() {

    const d = repDesde.value;
    const h = repHasta.value;
    const c = repResultados;

    if (!d || !h) {
        c.innerHTML = "<p>Selecciona un rango de fechas.</p>";
        return;
    }

    const r = await fetch(`/api/reportes/general?desde=${d}&hasta=${h}`);
    const x = await r.json();

    let html = `
    <div class="cards-summary">
        <div class="card-sum">
            <div class="icon"><i class="bi bi-cart-check"></i></div>
            <h3>Total ventas</h3>
            <p>${x.cantidadVentas}</p>
        </div>
        <div class="card-sum">
            <div class="icon"><i class="bi bi-currency-dollar"></i></div>
            <h3>Importe ventas</h3>
            <p>${formatoMoneda(x.totalVentas)}</p>
        </div>
        <div class="card-sum">
            <div class="icon"><i class="bi bi-box-seam"></i></div>
            <h3>Total compras</h3>
            <p>${x.cantidadCompras}</p>
        </div>
        <div class="card-sum">
            <div class="icon"><i class="bi bi-credit-card"></i></div>
            <h3>Importe compras</h3>
            <p>${formatoMoneda(x.totalCompras)}</p>
        </div>
    </div>

    <div class="cards-summary" style="margin-top:20px;">
        <div class="card-sum">
            <div class="icon"><i class="bi bi-graph-up-arrow"></i></div>
            <h3>Ganancias</h3>
            <p>${formatoMoneda(x.ganancias)}</p>
        </div>
        <div class="card-sum">
            <div class="icon"><i class="bi bi-receipt"></i></div>
            <h3>Ticket promedio</h3>
            <p>${formatoMoneda(x.ticketPromedio)}</p>
        </div>
    </div>
    `;

    html += `<div class="section-box"><div class="section-title"><i class="bi bi-shop"></i> Ventas</div>`;

    if (!x.ventas.length) {
        html += "<p>No hay ventas.</p></div>";
    } else {
        html += `<table class="table-custom"><thead>
            <tr><th>ID</th><th>Fecha</th><th>Total</th><th>Método</th></tr>
        </thead><tbody>`;
        x.ventas.forEach(v => {
            html += `<tr>
                <td>${v.id}</td>
                <td>${v.fecha.replace("T"," ")}</td>
                <td>${formatoMoneda(v.total)}</td>
                <td>${v.metodoPago}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }

    html += `<div class="section-box"><div class="section-title"><i class="bi bi-bag-check"></i> Compras</div>`;

    if (!x.compras.length) {
        html += "<p>No hay compras.</p></div>";
    } else {
        html += `<table class="table-custom"><thead>
            <tr><th>ID</th><th>Fecha</th><th>Total</th><th>Proveedor</th></tr>
        </thead><tbody>`;
        x.compras.forEach(c => {
            html += `<tr>
                <td>${c.id}</td>
                <td>${c.fecha.replace("T"," ")}</td>
                <td>${formatoMoneda(c.total)}</td>
                <td>${c.proveedorId}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }

    html += `<div class="section-box"><div class="section-title"><i class="bi bi-stars"></i> Top productos</div>`;

    if (!x.nombresProductos.length) {
        html += "<p>Sin datos.</p>";
    } else {
        x.nombresProductos.forEach((n,i)=>{
            html += `<div class="top-product">
                <span>${n}</span>
                <strong>${x.cantidadesProductos[i]} unidades</strong>
            </div>`;
        });
    }

    html += `</div>`;
    c.innerHTML = html;
}

function generarReportes(){ genRep(); }
