let prods = [];
let clis  = [];
let cart  = [];
let editId = null;
let cotActual = null;
let cotVentaCarrito = [];
let cotComisionTarjetaPct = 3; 
let cotImpuestoPct = 16;
let cotsCache = [];
let cotDetalleId = null;

async function ajaxGET(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function ajaxPOST(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function ajaxPUT(url, body) {
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null
  });
  if (!r.ok) throw new Error(await r.text());
  return r.text();
}

function _abrirModal(id){ (typeof abrirModal === "function") ? abrirModal(id) : (document.getElementById(id).style.display="flex"); }
function _cerrarModal(id){ (typeof cerrarModal === "function") ? cerrarModal(id) : (document.getElementById(id).style.display="none"); }

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadProds();
    await loadClis();
    await loadCots();
    hookConvertirVentaUI();
  } catch (e) {
    console.error(e);
    alertaError("No se pudo inicializar Cotizaciones");
  }
});

async function loadProds() {
  const r = await fetch("/api/productos");
  prods = (await r.json()).filter(p => (p.estado || "").toUpperCase() === "ACTIVO");

  const s = document.getElementById("cotProducto");
  if (!s) return;

  s.innerHTML = `<option value="">Producto</option>`;
  prods.forEach(p => {
    s.innerHTML += `<option value="${p.id}">${p.nombre} - $${Number(p.precio || 0).toFixed(2)}</option>`;
  });
}

async function loadClis() {
  const r = await fetch("/api/clientes");
  clis = (await r.json()).filter(c => (c.estado || "").toUpperCase() === "ACTIVO");

  const s = document.getElementById("cotCliente");
  if (!s) return;

  s.innerHTML = `<option value="">Cliente</option>`;
  clis.forEach(c => {
    s.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
  });
}

function agregarProductoCot() { addProd(); }
function addProd() {
  const id = Number(document.getElementById("cotProducto")?.value || 0);
  const q  = Number(document.getElementById("cotCantidad")?.value || 0);

  if (!id || q < 1) return alertaWarning("Producto / cantidad inválidos");

  const p = prods.find(x => Number(x.id) === id);
  if (!p) return alertaWarning("Producto no encontrado");

  const e = cart.find(x => Number(x.id) === id);
  if (e) e.q += q;
  else cart.push({ id: p.id, n: p.nombre, p: Number(p.precio || 0), q });

  drawCart();
}

function drawCart() {
  const tb = document.querySelector("#tablaCotCarrito tbody");
  if (!tb) return;

  tb.innerHTML = "";
  let tot = 0;

  if (!cart.length) {
    tb.innerHTML = `<tr><td colspan="5">Sin productos.</td></tr>`;
    const elTot = document.getElementById("cotTotal");
    if (elTot) elTot.textContent = "$0.00";
    return;
  }

  cart.forEach((i, x) => {
    const imp = i.q * i.p;
    tot += imp;

    tb.innerHTML += `
      <tr>
        <td>${i.n}</td>
        <td>${i.q}</td>
        <td>$${Number(i.p).toFixed(2)}</td>
        <td>$${imp.toFixed(2)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="cart.splice(${x},1);drawCart()">
            <i class="bi bi-x"></i>
          </button>
        </td>
      </tr>`;
  });

  const elTot = document.getElementById("cotTotal");
  if (elTot) elTot.textContent = "$" + tot.toFixed(2);
}

function nuevaCotizacion() {
  editId = null;
  cart = [];
  drawCart();

  const notas = document.getElementById("cotNotas");
  const vig   = document.getElementById("cotVigencia");
  const cli   = document.getElementById("cotCliente");
  const ttl   = document.getElementById("cotModalTitulo");

  if (notas) notas.value = "";
  if (vig) vig.value = 7;
  if (cli) cli.value = "";
  if (ttl) ttl.textContent = "Nueva Cotización";

  _abrirModal("modalCotizacion");
}

function guardarCotizacion() { saveCot(); }
async function saveCot() {
  if (!cart.length) return alertaWarning("Agrega productos a la cotización");
  const cliId = Number(document.getElementById("cotCliente")?.value || 0);
  if (!cliId) return alertaWarning("Selecciona un cliente");

  const body = {
    clienteId: cliId,
    diasVigencia: Number(document.getElementById("cotVigencia")?.value || 7),
    notas: (document.getElementById("cotNotas")?.value || ""),
    detalles: cart.map(i => ({
      productoId: Number(i.id),
      cantidad: Number(i.q),
      precio: Number(i.p)
    }))
  };

  const url = editId ? `/api/cotizaciones/${editId}` : "/api/cotizaciones";
  const m   = editId ? "PUT" : "POST";

  try {
    const r = await fetch(url, {
      method: m,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!r.ok) throw new Error(await r.text());

    alertaExito("Cotización guardada correctamente");

    cart = [];
    editId = null;
    _cerrarModal("modalCotizacion");
    await loadCots();

  } catch (e) {
    console.error(e);
    alertaError("No se pudo guardar la cotización");
  }
}

function renderCotizaciones() { loadCots(); }

async function loadCots() {
  try {
    const r = await fetch("/api/cotizaciones");
    const ls = await r.json();
    cotsCache = Array.isArray(ls) ? ls : [];
    paint(cotsCache);
  } catch (e) {
    console.error(e);
    paint([]);
    alertaError("No se pudieron cargar las cotizaciones");
  }
}

function paint(l) {
  const tb = document.querySelector("#tablaCotizaciones tbody");
  if (!tb) return;

  tb.innerHTML = "";
  if (!l || !l.length) {
    tb.innerHTML = `<tr><td colspan="7">No hay cotizaciones aún.</td></tr>`;
    return;
  }

  l.forEach(c => {
    tb.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.cliente?.nombre || ""}</td>
        <td>$${Number(c.total || 0).toFixed(2)}</td>
        <td>${c.vigencia || ""}</td>
        <td>${c.estado || ""}</td>
        <td>${c.notas || ""}</td>
        <td class="acciones">
          <button class="btn btn-info btn-sm" onclick="verDetalleCot(${c.id})" title="Detalle">
            <i class="bi bi-eye"></i>
          </button>

          <button class="btn btn-success btn-sm" onclick="toVenta(${c.id})" title="Convertir a venta">
            <i class="bi bi-arrow-repeat"></i>
          </button>

          <button class="btn btn-primary btn-sm" onclick="editCot(${c.id})" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>

          <button class="btn btn-danger btn-sm" onclick="cancelCot(${c.id})" title="Cancelar">
            <i class="bi bi-x-circle"></i>
          </button>
        </td>
      </tr>`;
  });

  resaltarDesdeConsulta();
}

async function verDetalleCot(id) {
  try {
    const r = await fetch(`/api/cotizaciones/${id}`);
    const c = await r.json();
    cotDetalleId = c?.id || id;

    const info = document.getElementById("detalleCotInfo");
    const tb   = document.getElementById("detalleCotTable");

    if (info) {
      info.innerHTML = `
        <b>Folio:</b> ${c.id}<br>
        <b>Cliente:</b> ${c.cliente?.nombre || ""}<br>
        <b>Estado:</b> ${c.estado || ""}<br>
        <b>Total:</b> $${Number(c.total || 0).toFixed(2)}<br>
        <b>Vigencia:</b> ${c.vigencia || ""}<br>
        <b>Notas:</b> ${c.notas || "-"}
      `;
    }

    if (tb) {
      tb.innerHTML = "";
      const dets = c.detalles || [];
      if (!dets.length) {
        tb.innerHTML = `<tr><td colspan="4">Sin productos</td></tr>`;
      } else {
        dets.forEach(d => {
          const p = prods.find(x => Number(x.id) === Number(d.productoId));
          const nombre = p ? p.nombre : "Producto";
          const sub = Number(d.precio || 0) * Number(d.cantidad || 0);
          tb.innerHTML += `
            <tr>
              <td>${nombre}</td>
              <td>${Number(d.cantidad || 0)}</td>
              <td>$${Number(d.precio || 0).toFixed(2)}</td>
              <td>$${sub.toFixed(2)}</td>
            </tr>`;
        });
      }
    }

    _abrirModal("modalDetalleCot");
  } catch (e) {
    console.error(e);
    alertaError("No se pudo cargar el detalle de la cotización");
  }
}

function imprimirCotizacion() {
  if (!cotDetalleId) return alertaWarning("Abre primero el detalle de una cotización");
  window.open(`/api/cotizaciones/pdf/${cotDetalleId}`, "_blank");
}

async function editCot(id) {
  try {
    const r = await fetch(`/api/cotizaciones/${id}`);
    const c = await r.json();

    const est = (c.estado || "").toUpperCase();
    if (["CONVERTIDA", "CANCELADA", "VENCIDA"].includes(est)) {
      alertaWarning(`La cotización está ${c.estado} y no puede editarse`);
      return;
    }

    editId = id;
    cart = [];

    const cli = document.getElementById("cotCliente");
    const vig = document.getElementById("cotVigencia");
    const not = document.getElementById("cotNotas");

    if (cli) cli.value = c.clienteId || "";
    if (vig) vig.value = (c.diasVigencia || 7);
    if (not) not.value = c.notas || "";

    if (c.detalles && c.detalles.length) {
      c.detalles.forEach(d => {
        const p = prods.find(x => Number(x.id) === Number(d.productoId));
        if (p) {
          cart.push({
            id: p.id,
            n: p.nombre,
            p: Number(d.precio || p.precio || 0),
            q: Number(d.cantidad || 1)
          });
        }
      });
    }

    drawCart();
    const ttl = document.getElementById("cotModalTitulo");
    if (ttl) ttl.textContent = "Editar Cotización";
    _abrirModal("modalCotizacion");

  } catch (e) {
    console.error(e);
    alertaError("No se pudo cargar la información de la cotización");
  }
}

async function cancelCot(id) {
  alertaConfirmacion(
    "Cancelar cotización",
    "¿Deseas cancelar esta cotización?",
    async () => {
      try {
        await fetch(`/api/cotizaciones/cancelar/${id}`, { method: "PUT" });
        alertaWarning("Cotización cancelada");
        await loadCots();
      } catch (e) {
        console.error(e);
        alertaError("No se pudo cancelar la cotización");
      }
    }
  );
}

function cotizacionesHoy() {
  const f = new Date().toISOString().split("T")[0];
  cotizacionesPorFecha(f);
}

async function cotizacionesPorFecha(fecha) {
  const f = fecha || document.getElementById("filtroFechaCot")?.value;
  if (!f) return alertaInfo("Selecciona fecha");

  try {
    const r = await fetch(`/api/cotizaciones/fecha?fecha=${encodeURIComponent(f)}`);
    const ls = await r.json();
    paint(ls);
  } catch (e) {
    console.error(e);
    alertaError("No se pudo filtrar por fecha");
  }
}

function abrirReporteCot() { _abrirModal("modalReporteCot"); }

async function cargarReporteCot() {
  const ini = document.getElementById("repCotInicio")?.value;
  const fin = document.getElementById("repCotFin")?.value;

  if (!ini || !fin) return alertaInfo("Selecciona el rango de fechas");

  try {
    const r = await fetch(`/api/cotizaciones/reporte?inicio=${encodeURIComponent(ini)}&fin=${encodeURIComponent(fin)}`);
    const d = await r.json();

    document.getElementById("kpiTotal").textContent       = "$" + Number(d.total || 0).toFixed(2);
    document.getElementById("kpiCantidad").textContent    = Number(d.cantidad || 0);
    document.getElementById("kpiConvertidas").textContent = Number(d.convertidas || 0);
    document.getElementById("kpiCanceladas").textContent  = Number(d.canceladas || 0);
    document.getElementById("kpiConversion").textContent  = (Number(d.conversion || 0)) + "%";

  } catch (e) {
    console.error(e);
    alertaError("No se pudo generar el reporte de cotizaciones");
  }
}

function hookConvertirVentaUI() {
document.getElementById("cotImpuestoInput")
  ?.addEventListener("input", e => {
    cotImpuestoPct = Number(e.target.value || 0);
    calcCotVenta();
  });

  document.querySelectorAll("input[name='cotMetodoPago']").forEach(r => {
    r.addEventListener("change", calcCotVenta);
  });

  ["cotPagaCon", "cotMixtoEfectivo", "cotMixtoTarjeta", "cotMixtoTransferencia"]
    .forEach(id => document.getElementById(id)?.addEventListener("input", calcCotVenta));

  document.getElementById("cotComisionTarjetaInput")?.addEventListener("input", (e) => {
    cotComisionTarjetaPct = Number(e.target.value || 0);
    calcCotVenta();
  });

  document.getElementById("btnCotConfirmarVenta")?.addEventListener("click", confirmarConvertirVenta);
}

async function toVenta(id) {
  try {
    const r = await fetch(`/api/cotizaciones/${id}`);
    const c = await r.json();

    const est = (c.estado || "").toUpperCase();
    if (["CONVERTIDA", "CANCELADA", "VENCIDA"].includes(est)) {
      alertaWarning(`No se puede convertir: la cotización está ${c.estado}`);
      return;
    }

    cotActual = c;
    cotVentaCarrito = [];

    const lbl = document.getElementById("cotVentaCliente");
    if (lbl) lbl.textContent = "Cliente: " + (c.cliente?.nombre || "");

    (c.detalles || []).forEach(d => {
      const p = prods.find(x => Number(x.id) === Number(d.productoId));
      cotVentaCarrito.push({
        productoId: Number(d.productoId),
        nombre: p ? p.nombre : "Producto",
        precio: Number(d.precio || 0),
        cantidad: Number(d.cantidad || 0),
        subtotal: Number(d.precio || 0) * Number(d.cantidad || 0)
      });
    });

    const inpCom = document.getElementById("cotComisionTarjetaInput");
    if (inpCom && (inpCom.value === "" || inpCom.value == 0)) inpCom.value = cotComisionTarjetaPct;

    limpiarPagoConvertir();

    pintarCotVentaCarrito();
    calcCotVenta();
    _abrirModal("modalConvertirVenta");

  } catch (e) {
    console.error(e);
    alertaError("No se pudo cargar la cotización");
  }
}

function pintarCotVentaCarrito() {
  const tb = document.querySelector("#tablaCotVentaCarrito tbody");
  if (!tb) return;

  tb.innerHTML = "";
  if (!cotVentaCarrito.length) {
    tb.innerHTML = `<tr><td colspan="4">Sin productos</td></tr>`;
    return;
  }

  cotVentaCarrito.forEach(p => {
    tb.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>$${Number(p.precio).toFixed(2)}</td>
        <td>$${Number(p.subtotal).toFixed(2)}</td>
      </tr>
    `;
  });
}

function limpiarPagoConvertir() {
  const ef = document.getElementById("cotPagaCon");
  const me = document.getElementById("cotMixtoEfectivo");
  const mt = document.getElementById("cotMixtoTarjeta");
  const mr = document.getElementById("cotMixtoTransferencia");

  if (ef) ef.value = "";
  if (me) me.value = "";
  if (mt) mt.value = "";
  if (mr) mr.value = "";

  const rEf = document.querySelector("input[name='cotMetodoPago'][value='efectivo']");
  if (rEf) rEf.checked = true;
}

function calcCotVenta() {

  const mt = document.querySelector("input[name='cotMetodoPago']:checked")?.value || "efectivo";

  const bloqueEf = document.getElementById("cotPagoEfectivo");
  const bloqueMx = document.getElementById("cotPagoMixto");
  const bloCom   = document.getElementById("cotBloqueComisionTarjeta");

  if (bloqueEf) bloqueEf.style.display = "none";
  if (bloqueMx) bloqueMx.style.display = "none";
  if (bloCom)   bloCom.style.display   = "none";

  if (mt === "efectivo" && bloqueEf) bloqueEf.style.display = "block";
  if (mt === "mixto" && bloqueMx) bloqueMx.style.display = "block";
  if (mt === "tarjeta" || mt === "mixto") {
    if (bloCom) bloCom.style.display = "block";
  }

  const sub = cotVentaCarrito.reduce((s, x) => s + Number(x.subtotal || 0), 0);
  const iva = sub * (cotImpuestoPct / 100);
  const pct = Number(cotComisionTarjetaPct || 0) / 100;

  let com = 0;
  let pagado = 0;

  if (mt === "efectivo") {
    pagado = Number(document.getElementById("cotPagaCon")?.value || 0);
  }

  if (mt === "tarjeta") {
    com = sub * pct;
    pagado = sub + iva + com;
  }

  if (mt === "transferencia") {
    pagado = sub + iva;
  }

  if (mt === "mixto") {
    const ef = Number(document.getElementById("cotMixtoEfectivo")?.value || 0);
    const tj = Number(document.getElementById("cotMixtoTarjeta")?.value || 0);
    const tr = Number(document.getElementById("cotMixtoTransferencia")?.value || 0);

    pagado = ef + tj + tr;
    com = tj * pct; 
  }

  const total = sub + iva + com;
  const cambio = pagado > total ? (pagado - total) : 0;
  const falta  = pagado < total ? (total - pagado) : 0;

  document.getElementById("cotVentaSubtotal").textContent = "$" + sub.toFixed(2);
  document.getElementById("cotVentaIVA").textContent = "$" + iva.toFixed(2);
  document.getElementById("cotVentaTotal").textContent = "$" + total.toFixed(2);

  document.getElementById("cotPagado").textContent = "$" + pagado.toFixed(2);
  document.getElementById("cotCambio").textContent = "$" + cambio.toFixed(2);
  document.getElementById("cotFalta").textContent  = "$" + falta.toFixed(2);

  document.getElementById("cotCambio").parentElement.style.display = cambio > 0 ? "flex" : "none";
  document.getElementById("cotFalta").parentElement.style.display  = falta  > 0 ? "flex" : "none";

  const btn = document.querySelector("#modalConvertirVenta .btn-cobrar");
  if (btn) btn.disabled = falta > 0;
}

function validarPagoConvertir() {
  const falta = Number((document.getElementById("cotFalta")?.textContent || "0").replace(/[$,]/g,"")) || 0;
  if (falta > 0) {
    alertaWarning(`Pago incompleto. Faltan $${falta.toFixed(2)}`);
    return false;
  }
  return true;
}


async function confirmarConvertirVenta() {
  try {
    if (!cotActual) return alertaError("No hay cotización seleccionada");
    if (!cotVentaCarrito.length) return alertaWarning("La cotización no tiene productos");

    const est = (cotActual.estado || "").toUpperCase();
    if (["CONVERTIDA", "CANCELADA", "VENCIDA"].includes(est)) {
      alertaWarning(`No se puede convertir: la cotización está ${cotActual.estado}`);
      return;
    }

    if (!validarPagoConvertir()) return;

    const metodo = document.querySelector("input[name='cotMetodoPago']:checked")?.value || "efectivo";

    const total = Number((document.getElementById("cotVentaTotal")?.textContent || "0").replace(/[$,]/g, "")) || 0;

    let pagos = null;
    if (metodo === "mixto") {
      pagos = {
        efectivo: Number(document.getElementById("cotMixtoEfectivo")?.value || 0),
        tarjeta: Number(document.getElementById("cotMixtoTarjeta")?.value || 0),
        transferencia: Number(document.getElementById("cotMixtoTransferencia")?.value || 0)
      };
    }

    const body = {
      clienteId: cotActual.clienteId,
      usuarioId: 1,
      metodoPago: metodo,
      total: total,
      comisionTarjetaPct: Number(cotComisionTarjetaPct || 0),
      pagos: pagos,
      detalles: cotVentaCarrito.map(x => ({
        productoId: Number(x.productoId),
        cantidad: Number(x.cantidad),
        precio: Number(x.precio),
        subtotal: Number(x.subtotal)
      }))
    };

    const r = await fetch("/api/ventas/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      alertaWarning("No hay una caja abierta. Abre una caja antes de convertir.");
      return;
    }

    try {
      await fetch(`/api/cotizaciones/marcar-convertida/${cotActual.id}`, { method: "PUT" });
    } catch (e) {
      console.warn("No se pudo marcar convertida, pero la venta se creó.");
    }

    _cerrarModal("modalConvertirVenta");
    alertaExito("Cotización convertida a venta correctamente");
    cotActual = null;
    cotVentaCarrito = [];
    await loadCots();

  } catch (e) {
    console.error(e);
    alertaError("Error al convertir la cotización");
  }
}

function resaltarDesdeConsulta() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("resaltar");
  if (!id) return;

  setTimeout(() => {
    const filas = document.querySelectorAll("#tablaCotizaciones tbody tr");
    filas.forEach(tr => {
      const celdaId = tr.children[0];
      if (celdaId && celdaId.textContent.trim() === id) {
        tr.classList.add("resaltado");
        tr.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    history.replaceState({}, document.title, location.pathname);
  }, 100);
}

function alerta(tipo, titulo, mensaje) {
  const box   = document.getElementById("alertBox");
  const icon  = document.getElementById("alertIcon");
  const title = document.getElementById("alertTitle");
  const msg   = document.getElementById("alertMessage");
  const btn   = document.getElementById("alertBtn");

  const icons = {
    info: "bi-info-circle",
    success: "bi-check-circle",
    error: "bi-x-circle",
    warning: "bi-exclamation-triangle"
  };

  if (box) box.className = `alert-box alert-${tipo}`;
  if (icon) icon.innerHTML = `<i class="bi ${icons[tipo]}"></i>`;
  if (title) title.textContent = titulo;
  if (msg) msg.textContent = mensaje;

  if (btn) btn.onclick = () => _cerrarModal("modalAlertModern");
  _abrirModal("modalAlertModern");
}

const alertaInfo    = m => alerta("info", "Información", m);
const alertaExito   = m => alerta("success", "Éxito", m);
const alertaError   = m => alerta("error", "Error", m);
const alertaWarning = m => alerta("warning", "Atención", m);

function alertaConfirmacion(titulo, mensaje, onAceptar) {
  alerta("warning", titulo, mensaje);
  const btn = document.getElementById("alertBtn");
  if (!btn) return;

  btn.onclick = () => {
    _cerrarModal("modalAlertModern");
    if (typeof onAceptar === "function") onAceptar();
  };
}
