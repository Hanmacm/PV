let sec = (t,i,h) => `
<div class="result-section">
<h3><i class="bi ${i}"></i> ${t}</h3>
<ul class="result-list">${h}</ul>
</div>`;

async function buscarConsultar(){

    let txt = consultaTxt.value.trim();
    let box = consultaResultados;

    if(!txt){
        box.innerHTML = "<p class='no-results'>Escribe algo para buscar.</p>";
        return;
    }

    let r = await fetch(`/api/consultas?texto=${encodeURIComponent(txt)}`);
    let d = await r.json();
    let out = "";

    if(d.productos?.length){
        let it = "";
        d.productos.forEach(x=>{
            it += `<li>${x.nombre} — ${formatoMoneda(x.precio)} (${x.categoria||"Sin categoría"})</li>`;
        });
        out += sec("Productos","bi-box",it);
    }

    if(d.clientes?.length){
        let it="";
        d.clientes.forEach(x=>{
            it += `<li>${x.nombre} — ${x.telefono||"-"} — ${x.correo||"-"}</li>`;
        });
        out += sec("Clientes","bi-person",it);
    }

    if(d.proveedores?.length){
        let it="";
        d.proveedores.forEach(x=>{
            it += `<li>${x.nombre} — ${x.empresa||"-"} — ${x.telefono||"-"}</li>`;
        });
        out += sec("Proveedores","bi-truck",it);
    }

    if(d.ventas?.length){
        let it="";
        d.ventas.forEach(x=>{
            let f = x.fecha?.replace("T"," ")||"";
            it += `<li>Venta #${x.id} — Cliente #${x.clienteId} — ${formatoMoneda(x.total)} — ${f}</li>`;
        });
        out += sec("Ventas","bi-receipt",it);
    }

    if(d.cotizaciones?.length){
        let it="";
        d.cotizaciones.forEach(x=>{
            let f = x.fecha?.replace("T"," ")||"";
            it += `<li>Cot #${x.id} — Cliente #${x.clienteId} — ${formatoMoneda(x.total)} — ${x.estado} — ${f}</li>`;
        });
        out += sec("Cotizaciones","bi-file-text",it);
    }

    if(d.compras?.length){
        let it="";
        d.compras.forEach(x=>{
            let f = x.fecha?.replace("T"," ")||"";
            it += `<li>Compra ${x.folio||"-"} — Prov #${x.proveedorId} — ${formatoMoneda(x.total)} — ${f}</li>`;
        });
        out += sec("Compras","bi-cart",it);
    }

    if(d.pedidos?.length){
        let it="";
        d.pedidos.forEach(x=>{
            let f = x.fecha?.replace("T"," ")||"";
            let c = x.cliente?.nombre || `Cliente #${x.clienteId||""}`;
            it += `<li>Pedido #${x.id} — ${c} — ${x.estado} — ${formatoMoneda(x.total||0)} — ${f}</li>`;
        });
        out += sec("Pedidos","bi-people",it);
    }

    box.innerHTML = out || "<p class='no-results'>No se encontraron resultados.</p>";
}
