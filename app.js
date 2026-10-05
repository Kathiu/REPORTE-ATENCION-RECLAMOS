const $ = id => document.getElementById(id);

let products = [];
let busy = false;

/* =========================================================
   FECHAS
   ========================================================= */

function todayISO() {
  const d = new Date();
  const local = new Date(
    d.getTime() - d.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 10);
}

if ($("fecha")) $("fecha").value = todayISO();
if ($("fechaAtencion")) $("fechaAtencion").value = todayISO();

function itemLetter(i) {
  return String.fromCharCode(65 + i);
}

/* =========================================================
   PRODUCTOS
   ========================================================= */

function addProduct(data = {}) {

  products.push({
    producto: data.producto || "",
    lote: data.lote || "",
    fv: data.fv || "",
    cantidad: data.cantidad || "",
    hallazgo: data.hallazgo || "",
    decision: data.decision || "",
    photos: Array.isArray(data.photos) ? data.photos : []
  });

  renderProducts();
  renderFindings();
}

function removeProduct(i) {

  if (!confirm(`¿Eliminar el ítem ${itemLetter(i)}?`)) {
    return;
  }

  products.splice(i, 1);

  renderProducts();
  renderFindings();
}

function renderProducts() {

  const table = $("productsTable");

  if (!table) return;

  const tbody = table.querySelector("tbody");

  if (!tbody) return;

  tbody.innerHTML = products.map((p, i) => `
    <tr>

      <td style="text-align:center;font-weight:700">
        ${itemLetter(i)}
      </td>

      <td>
        <input
          data-p="${i}"
          data-k="producto"
          value="${esc(p.producto)}"
        >
      </td>

      <td>
        <input
          data-p="${i}"
          data-k="lote"
          value="${esc(p.lote)}"
        >
      </td>

      <td>
        <input
          data-p="${i}"
          data-k="fv"
          value="${esc(p.fv)}"
          placeholder="MM/AAAA"
        >
      </td>

      <td>
        <input
          data-p="${i}"
          data-k="cantidad"
          value="${esc(p.cantidad)}"
          type="number"
          min="0"
          step="any"
        >
      </td>

      <td>
        <button
          type="button"
          class="danger"
          onclick="removeProduct(${i})"
        >
          ×
        </button>
      </td>

    </tr>
  `).join("");

  tbody.querySelectorAll("input").forEach(inp => {

    inp.addEventListener("input", () => {

      const index = Number(inp.dataset.p);
      const key = inp.dataset.k;

      if (products[index]) {
        products[index][key] = inp.value;
      }

    });

  });
}

if ($("addProduct")) {
  $("addProduct").addEventListener("click", () => addProduct());
}

/* =========================================================
   HALLAZGOS Y FOTOGRAFÍAS
   ========================================================= */

function renderFindings() {

  const container = $("findings");

  if (!container) return;

  container.innerHTML = products.map((p, i) => `

    <div class="finding">

      <div class="item-title">
        ÍTEM ${itemLetter(i)} ·
        ${esc(p.producto || "Producto pendiente")}
      </div>

      <div class="finding-body">

        <label>
          Descripción de los hallazgos

          <textarea
            data-h="${i}"
            placeholder="Describa el hallazgo correspondiente al ítem ${itemLetter(i)}"
          >${esc(p.hallazgo)}</textarea>

        </label>

        <label style="margin-top:10px">
          Resultado del reclamo

          <select data-d="${i}">

            <option value="">
              Seleccione...
            </option>

            <option
              value="PROCEDE"
              ${p.decision === "PROCEDE" ? "selected" : ""}
            >
              PROCEDE
            </option>

            <option
              value="NO PROCEDE"
              ${p.decision === "NO PROCEDE" ? "selected" : ""}
            >
              NO PROCEDE
            </option>

          </select>

        </label>

        <div class="photo-area">

          <strong>
            Evidencia fotográfica del ítem ${itemLetter(i)}
          </strong>

          <div class="photo-actions">

            <button
              type="button"
              class="primary"
              onclick="openCamera(${i})"
            >
              📷 Tomar foto
            </button>

            <button
              type="button"
              class="secondary"
              onclick="openGallery(${i})"
            >
              🖼 Seleccionar foto
            </button>

            <input
              class="photo-input"
              id="camera-${i}"
              type="file"
              accept="image/*"
              capture="environment"
              onchange="handlePhoto(event,${i})"
            >

            <input
              class="photo-input"
              id="gallery-${i}"
              type="file"
              accept="image/*"
              multiple
              onchange="handlePhoto(event,${i})"
            >

          </div>

          <div class="photo-note">

            ${p.photos.length}
            foto(s).
            Se comprimirán antes de subirlas a Google Drive.

          </div>

          <div class="photo-grid">

            ${p.photos.map((ph, j) => `

              <div class="photo-card">

                <img
                  src="${esc(ph.dataUrl || "")}"
                  alt="Foto ${j + 1} del ítem ${itemLetter(i)}"
                >

                <button
                  type="button"
                  onclick="removePhoto(${i},${j})"
                >
                  Eliminar
                </button>

                <div class="photo-name">
                  Foto ${j + 1}
                </div>

              </div>

            `).join("")}

          </div>

        </div>

      </div>

    </div>

  `).join("");

  container
    .querySelectorAll("textarea[data-h]")
    .forEach(el => {

      el.addEventListener("input", () => {

        const index = Number(el.dataset.h);

        if (products[index]) {
          products[index].hallazgo = el.value;
        }

      });

    });

  container
    .querySelectorAll("select[data-d]")
    .forEach(el => {

      el.addEventListener("change", () => {

        const index = Number(el.dataset.d);

        if (products[index]) {
          products[index].decision = el.value;
        }

        autoConclusion();

      });

    });

}

function openCamera(i) {

  const input = $("camera-" + i);

  if (input) {
    input.click();
  }

}

function openGallery(i) {

  const input = $("gallery-" + i);

  if (input) {
    input.click();
  }

}

/* =========================================================
   FOTOGRAFÍAS
   ========================================================= */

async function handlePhoto(e, i) {

  const files = [...(e.target.files || [])];

  if (!files.length) {
    return;
  }

  if (!products[i]) {
    return;
  }

  for (const file of files) {

    try {

      setProgress(
        `Procesando fotografía del ítem ${itemLetter(i)}...`
      );

      const dataUrl = await compressImage(
        file,
        1600,
        0.78
      );

      products[i].photos.push({
        dataUrl,
        name:
          file.name ||
          `foto_${Date.now()}.jpg`
      });

    } catch (err) {

      showError(
        "No se pudo procesar una fotografía: " +
        (err.message || err)
      );

    }

  }

  e.target.value = "";

  renderFindings();

}

function removePhoto(i, j) {

  if (!products[i]) return;

  products[i].photos.splice(j, 1);

  renderFindings();

}

/*
 * Compresión real en el navegador.
 *
 * Esto reduce:
 * - resolución
 * - peso JPEG
 *
 * Antes de enviarlo a Apps Script.
 */

function compressImage(
  file,
  maxSide = 1600,
  quality = 0.78
) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onerror = () => {
      reject(
        new Error("No se pudo leer la imagen.")
      );
    };

    reader.onload = () => {

      const img = new Image();

      img.onload = () => {

        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (!w || !h) {
          reject(
            new Error("La imagen no tiene dimensiones válidas.")
          );
          return;
        }

        const largestSide = Math.max(w, h);

        const scale = Math.min(
          1,
          maxSide / largestSide
        );

        w = Math.round(w * scale);
        h = Math.round(h * scale);

        const canvas =
          document.createElement("canvas");

        canvas.width = w;
        canvas.height = h;

        const ctx =
          canvas.getContext("2d", {
            alpha: false
          });

        if (!ctx) {
          reject(
            new Error("No se pudo preparar la imagen.")
          );
          return;
        }

        ctx.drawImage(
          img,
          0,
          0,
          w,
          h
        );

        const result =
          canvas.toDataURL(
            "image/jpeg",
            quality
          );

        if (!result || result.length < 100) {
          reject(
            new Error("No se pudo comprimir la imagen.")
          );
          return;
        }

        resolve(result);

      };

      img.onerror = () => {

        reject(
          new Error("Imagen no válida.")
        );

      };

      img.src = reader.result;

    };

    reader.readAsDataURL(file);

  });

}

/* =========================================================
   CONCLUSIÓN
   ========================================================= */

function autoConclusion() {

  const decisions =
    products
      .map(p => p.decision)
      .filter(Boolean);

  if (!decisions.length) {

    if ($("conclusion")) {
      $("conclusion").value = "";
    }

    return;
  }

  if (!$("conclusion")) return;

  if (
    decisions.every(
      x => x === "PROCEDE"
    )
  ) {

    $("conclusion").value = "PROCEDE";

  } else if (
    decisions.every(
      x => x === "NO PROCEDE"
    )
  ) {

    $("conclusion").value = "NO PROCEDE";

  } else {

    $("conclusion").value = "";

  }

}

/* =========================================================
   OBTENER DATOS
   ========================================================= */

function getValue(id) {

  const el = $(id);

  return el ? el.value.trim() : "";

}

function getData() {

  autoConclusion();

  return {

    nReporte:
      getValue("nReporte"),

    fecha:
      $("fecha")?.value || "",

    cliente:
      getValue("cliente"),

    rrcl:
      getValue("rrcl"),

    fechaRecepcion:
      $("fechaRecepcion")?.value || "",

    fechaAtencion:
      $("fechaAtencion")?.value || "",

    factura:
      getValue("factura"),

    vendedor:
      getValue("vendedor"),

    descripcionReclamo:
      getValue("descripcionReclamo"),

    productos:
      products.map((p, i) => ({

        item:
          itemLetter(i),

        producto:
          p.producto,

        lote:
          p.lote,

        fv:
          p.fv,

        cantidad:
          p.cantidad,

        hallazgo:
          p.hallazgo,

        decision:
          p.decision,

        photos:
          p.photos.map((x, j) => ({

            index:
              j + 1,

            name:
              x.name,

            dataUrl:
              x.dataUrl

          }))

      })),

    destino:
      getValue("destino"),

    conclusion:
      getValue("conclusion"),

    accionCorrectiva:
      getValue("accionCorrectiva"),

    preparadoPor:
      getValue("preparadoPor"),

    aprobadoPor:
      getValue("aprobadoPor")

  };

}

/* =========================================================
   URL DE APPS SCRIPT
   ========================================================= */

function getAppsScriptUrl() {

  const url =
    window.APP_CONFIG?.APPS_SCRIPT_URL ||
    "";

  return String(url).trim();

}

/* =========================================================
   VALIDAR URL
   ========================================================= */

function validateAppsScriptUrl(url) {

  if (!url) {

    throw new Error(
      "No está configurada la URL de Google Apps Script."
    );

  }

  if (
    url.includes("PEGAR_AQUI") ||
    url.includes("TU_URL") ||
    url.includes("XXXXXXXX")
  ) {

    throw new Error(
      "La URL de Google Apps Script todavía no está configurada."
    );

  }

  if (
    !url.startsWith(
      "https://script.google.com/macros/s/"
    )
  ) {

    throw new Error(
      "La URL de Apps Script no tiene el formato correcto."
    );

  }

  if (!url.endsWith("/exec")) {

    throw new Error(
      "La URL de Apps Script debe terminar en /exec. No uses /dev."
    );

  }

}

/* =========================================================
   GENERAR REPORTE
   ========================================================= */

async function generateReport() {

  if (busy) return;

  const url =
    getAppsScriptUrl();

  try {

    validateAppsScriptUrl(url);

  } catch (err) {

    showError(
      err.message
    );

    return;

  }

  if (!products.length) {

    showError(
      "Agrega al menos un producto."
    );

    return;

  }

  const data =
    getData();

  /* -------------------------------------------------------
     VALIDACIONES
     ------------------------------------------------------- */

  for (
    const [i, p]
    of products.entries()
  ) {

    if (!p.producto.trim()) {

      showError(
        `Completa el producto del ítem ${itemLetter(i)}.`
      );

      return;

    }

    if (!p.hallazgo.trim()) {

      showError(
        `Completa el hallazgo del ítem ${itemLetter(i)}.`
      );

      return;

    }

    if (!p.decision) {

      showError(
        `Selecciona PROCEDE o NO PROCEDE para el ítem ${itemLetter(i)}.`
      );

      return;

    }

  }

  /* -------------------------------------------------------
     INICIO
     ------------------------------------------------------- */

  busy = true;

  if ($("generate")) {
    $("generate").disabled = true;
  }

  try {

    const reportKey =
      `${data.nReporte || "SIN_NUMERO"}_${Date.now()}`;

    const total =
      data.productos.reduce(
        (n, p) =>
          n + p.photos.length,
        0
      );

    let done = 0;

    /* -----------------------------------------------------
       SUBIR FOTOGRAFÍAS
       ----------------------------------------------------- */

    for (
      const p
      of data.productos
    ) {

      for (
        const ph
        of p.photos
      ) {

        done++;

        setProgress(
          `Subiendo foto ${done} de ${total} · Ítem ${p.item}...`
        );

        const parts =
          String(ph.dataUrl || "")
            .split(",");

        if (parts.length < 2) {

          throw new Error(
            `La fotografía ${ph.index} del ítem ${p.item} no tiene un formato válido.`
          );

        }

        const b64 =
          parts[1];

        const res =
          await postJSON(
            url,
            {

              action:
                "uploadPhoto",

              reportKey:
                reportKey,

              item:
                p.item,

              index:
                ph.index,

              name:
                ph.name,

              base64:
                b64

            }
          );

        if (!res || !res.ok) {

          throw new Error(
            res?.error ||
            `No se pudo subir la fotografía ${ph.index} del ítem ${p.item}.`
          );

        }

        ph.fileId =
          res.fileId;

      }

    }

    /* -----------------------------------------------------
       GENERAR PDF
       ----------------------------------------------------- */

    setProgress(
      "Generando el reporte PDF..."
    );

    const clean = {
      ...data,
      reportKey
    };

    clean.productos =
      clean.productos.map(
        p => ({

          ...p,

          photos:
            p.photos.map(
              ph => ({

                index:
                  ph.index,

                name:
                  ph.name,

                fileId:
                  ph.fileId

              })
            )

        })
      );

    const result =
      await postJSON(
        url,
        {

          action:
            "generateReport",

          data:
            clean

        }
      );

    if (!result || !result.ok) {

      throw new Error(
        result?.error ||
        "No se pudo generar el PDF."
      );

    }

    if ($("progress")) {
      $("progress")
        .classList
        .add("hidden");
    }

    const pdfUrl =
      result.pdfUrl || "";

    if (!pdfUrl) {

      throw new Error(
        "El servidor generó el reporte pero no devolvió el enlace del PDF."
      );

    }

    $("result").innerHTML = `

      <div class="success">

        <b>
          Reporte generado correctamente.
        </b>

        <br><br>

        <a
          href="${esc(pdfUrl)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          📄 Abrir / descargar PDF
        </a>

        <br><br>

        <small>
          Las fotografías quedaron organizadas
          en Google Drive por reporte e ítem.
        </small>

      </div>

    `;

  } catch (err) {

    if ($("progress")) {
      $("progress")
        .classList
        .add("hidden");
    }

    console.error(
      "ERROR GENERANDO REPORTE:",
      err
    );

    showError(
      err?.message ||
      String(err)
    );

  } finally {

    busy = false;

    if ($("generate")) {
      $("generate").disabled = false;
    }

  }

}

/* =========================================================
   POST A APPS SCRIPT
   ========================================================= */

async function postJSON(
  url,
  payload
) {

  let response;

  try {

    /*
     * IMPORTANTE:
     *
     * NO usamos application/json.
     *
     * Usamos text/plain para evitar que el navegador
     * haga un preflight OPTIONS que Apps Script no maneja
     * correctamente como API CORS.
     */

    response =
      await fetch(
        url,
        {

          method:
            "POST",

          mode:
            "cors",

          redirect:
            "follow",

          cache:
            "no-store",

          headers:
            {

              "Content-Type":
                "text/plain;charset=utf-8"

            },

          body:
            JSON.stringify(payload)

        }
      );

  } catch (networkError) {

    throw new Error(
      "No se pudo conectar con Google Apps Script. " +
      "Verifica que la implementación esté activa, " +
      "que la URL termine en /exec y que el acceso de la aplicación web permita utilizarla."
    );

  }

  const text =
    await response.text();

  /*
   * Apps Script debe devolver JSON.
   */

  try {

    const result =
      JSON.parse(text);

    return result;

  } catch (jsonError) {

    console.error(
      "Respuesta recibida desde Apps Script:",
      text
    );

    /*
     * Detectar HTML de Google.
     */

    const lower =
      text.toLowerCase();

    if (
      lower.includes("<!doctype html") ||
      lower.includes("<html") ||
      lower.includes("google")
    ) {

      throw new Error(
        "Google Apps Script devolvió una página HTML en lugar de JSON. " +
        "Verifica que la URL configurada sea la implementación /exec " +
        "y que la aplicación web tenga acceso permitido."
      );

    }

    throw new Error(
      "Respuesta no válida del servidor: " +
      text.slice(0, 500)
    );

  }

}

/* =========================================================
   PROBAR CONEXIÓN
   ========================================================= */

async function testAppsScriptConnection() {

  const url =
    getAppsScriptUrl();

  try {

    validateAppsScriptUrl(url);

  } catch (err) {

    showError(
      err.message
    );

    return;

  }

  setProgress(
    "Comprobando conexión con Google Apps Script..."
  );

  try {

    /*
     * GET de prueba.
     *
     * Tu Code.gs tiene doGet() y debería devolver JSON.
     */

    const response =
      await fetch(
        url +
        (
          url.includes("?")
            ? "&"
            : "?"
        ) +
        "check=" +
        Date.now(),
        {

          method:
            "GET",

          mode:
            "cors",

          redirect:
            "follow",

          cache:
            "no-store"

        }
      );

    const text =
      await response.text();

    let result;

    try {

      result =
        JSON.parse(text);

    } catch (e) {

      console.error(
        "Respuesta HTML de prueba:",
        text
      );

      throw new Error(
        "Apps Script está devolviendo HTML en lugar de JSON. " +
        "La implementación /exec debe revisarse."
      );

    }

    if (!result.ok) {

      throw new Error(
        result.error ||
        "Apps Script respondió pero indicó un error."
      );

    }

    if ($("progress")) {
      $("progress")
        .classList
        .add("hidden");
    }

    if ($("status")) {

      $("status").textContent =
        "Google Apps Script conectado correctamente.";

    }

    return result;

  } catch (err) {

    if ($("progress")) {
      $("progress")
        .classList
        .add("hidden");
    }

    showError(
      "No se pudo comprobar la conexión: " +
      (err.message || err)
    );

    return null;

  }

}

/* =========================================================
   PROGRESO
   ========================================================= */

function setProgress(msg) {

  const progress =
    $("progress");

  if (!progress) return;

  progress.textContent =
    msg;

  progress.classList.remove(
    "hidden"
  );

}

/* =========================================================
   ERRORES
   ========================================================= */

function showError(msg) {

  const result =
    $("result");

  if (!result) {

    console.error(
      msg
    );

    return;

  }

  result.innerHTML = `

    <div class="error">

      <b>Error:</b><br>

      ${esc(msg)}

    </div>

  `;

}

/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function esc(v) {

  return String(
    v ?? ""
  ).replace(
    /[&<>"']/g,
    m => ({

      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#39;"

    }[m])
  );

}

/* =========================================================
   BORRADOR
   ========================================================= */

function draftObject() {

  return {

    ...getData(),

    products

  };

}

if ($("saveDraft")) {

  $("saveDraft")
    .addEventListener(
      "click",
      () => {

        try {

          localStorage.setItem(
            "reclamos_draft",
            JSON.stringify(
              draftObject()
            )
          );

          if ($("status")) {

            $("status").textContent =
              "Borrador guardado en este celular.";

          }

        } catch (e) {

          showError(
            "No se pudo guardar el borrador. " +
            "Las fotografías pueden ocupar demasiado espacio en el almacenamiento local."
          );

        }

      }
    );

}

if ($("loadDraft")) {

  $("loadDraft")
    .addEventListener(
      "click",
      () => {

        const raw =
          localStorage.getItem(
            "reclamos_draft"
          );

        if (!raw) {

          showError(
            "No hay borrador guardado."
          );

          return;

        }

        try {

          loadData(
            JSON.parse(raw)
          );

          if ($("status")) {

            $("status").textContent =
              "Borrador cargado.";

          }

        } catch (e) {

          showError(
            "El borrador no se pudo cargar."
          );

        }

      }
    );

}

if ($("clearDraft")) {

  $("clearDraft")
    .addEventListener(
      "click",
      () => {

        if (
          confirm(
            "¿Borrar el borrador guardado?"
          )
        ) {

          localStorage.removeItem(
            "reclamos_draft"
          );

          if ($("status")) {

            $("status").textContent =
              "Borrador borrado.";

          }

        }

      }
    );

}

/* =========================================================
   CARGAR DATOS
   ========================================================= */

function loadData(d) {

  const fields = [

    "nReporte",
    "fecha",
    "cliente",
    "rrcl",
    "fechaRecepcion",
    "fechaAtencion",
    "factura",
    "vendedor",
    "descripcionReclamo",
    "destino",
    "conclusion",
    "accionCorrectiva",
    "preparadoPor",
    "aprobadoPor"

  ];

  fields.forEach(
    id => {

      if (
        d[id] !== undefined &&
        $(id)
      ) {

        $(id).value =
          d[id];

      }

    }
  );

  products =
    (d.productos || [])
      .map(
        p => ({

          producto:
            p.producto || "",

          lote:
            p.lote || "",

          fv:
            p.fv || "",

          cantidad:
            p.cantidad || "",

          hallazgo:
            p.hallazgo || "",

          decision:
            p.decision || "",

          photos:
            Array.isArray(p.photos)
              ? p.photos
              : []

        })
      );

  renderProducts();
  renderFindings();

}

/* =========================================================
   EVENTOS
   ========================================================= */

if ($("generate")) {

  $("generate")
    .addEventListener(
      "click",
      generateReport
    );

}

/*
 * Si existe un botón con id="testConnection",
 * permite probar Apps Script manualmente.
 */

if ($("testConnection")) {

  $("testConnection")
    .addEventListener(
      "click",
      testAppsScriptConnection
    );

}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

renderProducts();
renderFindings();

if (!products.length) {
  addProduct();
}
