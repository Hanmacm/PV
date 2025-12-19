let prods = []
let clis = []
let cart = []
let editId = null

document.addEventListener("DOMContentLoaded", async () => {
    await loadProds()
    await loadClis()
    loadCots()
})

async function loadProds(){
    const r = await fetch("/api/productos")
    prods = (await r.json()).filter(p => p.estado === "ACTIVO")
    const s = document.getElementById("cotProducto")
    s.innerHTML = `<option value="">Producto</option>`
    prods.forEach(p=>{
        s.innerHTML += `<option value="${p.id}">${p.nombre} - $${p.precio}</option>`
    })
}

async function loadClis(){
    const r = await fetch("/api/clientes")
    clis = (await r.json()).filter(c => c.estado === "ACTIVO")
    const s = document.getElementById("cotCliente")
    s.innerHTML = `<option value="">Cliente</option>`
    clis.forEach(c=>{
        s.innerHTML += `<option value="${c.id}">${c.nombre}</option>`
    })
}

function addProd(){
    const id = cotProducto.value
    const q = Number(cotCantidad.value)
    if(!id || q < 1) return

    const p = prods.find(x=>x.id==id)
    const e = cart.find(x=>x.id==id)

    e ? e.q += q : cart.push({id:p.id,n:p.nombre,p:p.precio,q})
    drawCart()
}

function drawCart(){
    const tb = document.querySelector("#tablaCotCarrito tbody")
    tb.innerHTML = ""
    let tot = 0

    if(cart.length===0){
        tb.innerHTML = `<tr><td colspan="5">Vacío</td></tr>`
        cotTotal.textContent = "$0.00"
        return
    }

    cart.forEach((i,x)=>{
        tot += i.q * i.p
        tb.innerHTML += `
        <tr>
            <td>${i.n}</td>
            <td>${i.q}</td>
            <td>$${i.p}</td>
            <td>$${(i.q*i.p).toFixed(2)}</td>
            <td><button onclick="cart.splice(${x},1);drawCart()">✖</button></td>
        </tr>`
    })

    cotTotal.textContent = "$" + tot.toFixed(2)
}

async function saveCot(){
    if(cart.length===0) return
    const body = {
        clienteId:Number(cotCliente.value),
        diasVigencia:Number(cotVigencia.value),
        notas:cotNotas.value,
        detalles:cart.map(i=>({
            productoId:i.id,
            cantidad:i.q,
            precio:i.p
        }))
    }

    const url = editId ? `/api/cotizaciones/${editId}` : "/api/cotizaciones"
    const m = editId ? "PUT" : "POST"

    await fetch(url,{
        method:m,
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body)
    })

    cart=[]
    editId=null
    cerrarModal("modalCotizacion")
    loadCots()
}

async function loadCots(){
    const r = await fetch("/api/cotizaciones")
    paint(await r.json())
}

function paint(l){
    const tb = document.querySelector("#tablaCotizaciones tbody")
    tb.innerHTML = ""
    if(!l.length){
        tb.innerHTML=`<tr><td colspan="7">Sin datos</td></tr>`
        return
    }

    l.forEach(c=>{
        tb.innerHTML+=`
        <tr>
            <td>${c.id}</td>
            <td>${c.cliente?.nombre||""}</td>
            <td>$${c.total?.toFixed(2)}</td>
            <td>${c.vigencia||""}</td>
            <td>${c.estado}</td>
            <td>${c.notas||""}</td>
            <td class="acciones">
    <button class="btn btn-success btn-sm"
        onclick="toVenta(${c.id})"
        title="Convertir a venta">
        <i class="bi bi-arrow-repeat"></i>
    </button>

    <button class="btn btn-primary btn-sm"
        onclick="editCot(${c.id})"
        title="Editar cotización">
        <i class="bi bi-pencil"></i>
    </button>

    <button class="btn btn-danger btn-sm"
        onclick="cancelCot(${c.id})"
        title="Cancelar cotización">
        <i class="bi bi-x-circle"></i>
    </button>
</td>

        </tr>`
    })
}

async function toVenta(id){
    await fetch(`/api/cotizaciones/convertir/${id}`,{method:"POST"})
    loadCots()
}

async function cancelCot(id){
    await fetch(`/api/cotizaciones/cancelar/${id}`,{method:"PUT"})
    loadCots()
}
function nuevaCotizacion(){
    editId = null
    cart = []
    drawCart()
    cotNotas.value = ""
    cotVigencia.value = 7
    document.getElementById("cotModalTitulo").textContent = "Nueva Cotización"
    abrirModal("modalCotizacion")
}

function agregarProductoCot(){
    addProd()
}

function guardarCotizacion(){
    saveCot()
}

function renderCotizaciones(){
    loadCots()
}

function cotizacionesHoy(){
    const f = new Date().toISOString().split("T")[0]
    cotizacionesPorFecha(f)
}

async function cotizacionesPorFecha(fecha){
    const f = fecha || document.getElementById("filtroFechaCot").value
    if(!f) return

    const r = await fetch(`/api/cotizaciones/fecha?fecha=${f}`)
    paint(await r.json())
}

function abrirReporteCot(){
    abrirModal("modalReporteCot")
}
