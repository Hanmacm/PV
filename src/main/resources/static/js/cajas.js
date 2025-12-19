let cjAct = null;
let hist = [];

const $ = (id) => document.getElementById(id);

function money(n) {
  const x = Number(n || 0);
  return "$" + x.toFixed(2);
}

async function jget(u) {
  const r = await fetch(u);
  if (!r.ok) throw new Error("GET " + u);
  return r.json();
}

async function jpost(u) {
  const r = await fetch(u, { method: "POST" });
  if (!r.ok) throw new Error("POST " + u);
  return r.json();
}

function txtCajaActiva(cj) {
  if (!cj) return "No hay caja abierta";

  const f = cj.fechaInicio ? String(cj.fechaInicio).replace("T", " ") : "";
  return `Caja #${cj.id} abierta desde ${f}`;
}

async function refrescarCaja() {
  try {
    cjAct = await jget("/api/cajas/actual");
  } catch (e) {
    console.error(e);
    cjAct = null;
  }

  const lbl = $("cajaActualLabel");
  if (lbl) lbl.textContent = txtCajaActiva(cjAct);
}

async function abrirCaja() {
  const val = Number($("cajaMontoInicial").value);

  if (!Number.isFinite(val) || val < 0) {
    alert("Pon un monto inicial válido");
    return;
  }

  try {
    await jpost(`/api/cajas/abrir?monto=${encodeURIComponent(val)}&usuario=1`);
    await refrescarCaja();
    await cargarLista();
    await cargarMovs();
  } catch (e) {
    console.error(e);
    alert("No se pudo abrir (¿ya hay una abierta?)");
  }
}

async function cerrarCaja() {
  try {
    await jpost("/api/cajas/cerrar");
    await refrescarCaja();
    await cargarLista();
    await cargarMovs();
  } catch (e) {
    console.error(e);
    alert("No se pudo cerrar (¿hay caja abierta?)");
  }
}

async function agregarMovimiento() {
  const tipo = $("cajaTipoMov").value;
  const monto = Number($("cajaMontoMov").value);
  const conc = ($("cajaConcepto").value || "").trim();

  if (!Number.isFinite(monto) || monto <= 0) {
    alert("Monto inválido");
    return;
  }

  const c = conc.length ? conc : "Movimiento";
  const url = `/api/cajas/movimiento?tipo=${encodeURIComponent(tipo)}&monto=${encodeURIComponent(monto)}&concepto=${encodeURIComponent(c)}`;

  try {
    await jpost(url);
    $("cajaMontoMov").value = "";
    $("cajaConcepto").value = "";
    await refrescarCaja();
    await cargarMovs();
  } catch (e) {
    console.error(e);
    alert("No se pudo registrar el movimiento");
  }
}

async function cargarMovs() {
  const tb = document.querySelector("#tablaMovimientos tbody");
  if (!tb) return;

  await refrescarCaja();

  const movs = (cjAct && Array.isArray(cjAct.movimientos)) ? cjAct.movimientos : [];
  if (!movs.length) {
    tb.innerHTML = `<tr><td colspan="4">Sin movimientos.</td></tr>`;
    return;
  }

  tb.innerHTML = "";
  movs.forEach(m => {
    const f = m.fecha ? String(m.fecha).replace("T", " ") : "-";
    tb.innerHTML += `
      <tr>
        <td>${m.tipo || "-"}</td>
        <td>${money(m.monto)}</td>
        <td>${m.concepto || "-"}</td>
        <td>${f}</td>
      </tr>
    `;
  });
}

async function cargarLista() {
  const tb = document.querySelector("#tablaCajas tbody");
  if (!tb) return;

  try {
    hist = await jget("/api/cajas/historial");
  } catch (e) {
    console.error(e);
    hist = [];
  }

  if (!hist.length) {
    tb.innerHTML = `<tr><td colspan="7">Sin registros.</td></tr>`;
    return;
  }

  tb.innerHTML = "";
  hist.forEach(c => {
    const ini = c.fechaInicio ? String(c.fechaInicio).replace("T", " ") : "-";
    const fin = c.fechaCierre ? String(c.fechaCierre).replace("T", " ") : "-";

    const btn = (c.estado === "Cerrada")
      ? `<button class="btn btn-info btn-sm" onclick="verDetalleCaja(${c.id})"><i class="bi bi-eye"></i></button>`
      : "-";

    tb.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${ini}</td>
        <td>${fin}</td>
        <td>${money(c.montoInicial)}</td>
        <td>${c.montoFinal == null ? "-" : money(c.montoFinal)}</td>
        <td>${c.estado || "-"}</td>
        <td>${btn}</td>
      </tr>
    `;
  });
}

async function verDetalleCaja(idCaja) {
  abrirModal("modalDetalleCaja");

  const tb = document.querySelector("#tablaDetalleCaja tbody");
  if (!tb) return;

  tb.innerHTML = `<tr><td colspan="4">Cargando...</td></tr>`;

  try {
    const movs = await jget(`/api/cajas/${idCaja}/movimientos`);

    if (!movs.length) {
      tb.innerHTML = `<tr><td colspan="4">Sin movimientos</td></tr>`;
      return;
    }

    tb.innerHTML = "";
    movs.forEach(m => {
      const f = m.fecha ? String(m.fecha).replace("T", " ") : "-";
      tb.innerHTML += `
        <tr>
          <td>${m.tipo || "-"}</td>
          <td>${money(m.monto)}</td>
          <td>${m.concepto || "-"}</td>
          <td>${f}</td>
        </tr>
      `;
    });

  } catch (e) {
    console.error(e);
    tb.innerHTML = `<tr><td colspan="4">Error cargando detalle</td></tr>`;
  }
}

async function abrirReporteCajas() {
  abrirModal("modalReporteCajas");

  try {
    const r = await jget("/api/cajas/reporte");

    $("kpiTotalCajas").textContent = r.totalCajas ?? 0;
    $("kpiAbiertas").textContent = r.cajasAbiertas ?? 0;
    $("kpiCerradas").textContent = r.cajasCerradas ?? 0;

    $("kpiEntradas").textContent = money(r.totalEntradas ?? 0);
    $("kpiSalidas").textContent = money(r.totalSalidas ?? 0);
    $("kpiBalance").textContent = money(r.balance ?? 0);

  } catch (e) {
    console.error(e);
    alert("No se pudo cargar el reporte");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await refrescarCaja();
  await cargarLista();
  await cargarMovs();
});
