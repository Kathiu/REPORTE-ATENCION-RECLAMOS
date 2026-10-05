const $ = id => document.getElementById(id);
let products = [];
let busy = false;

function todayISO(){
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,10);
}
$("fecha").value = todayISO();
$("fechaAtencion").value = todayISO();

function itemLetter(i){ return String.fromCharCode(65+i); }

function addProduct(data={}){
  products.push({
    producto:data.producto||"",
    lote:data.lote||"",
    fv:data.fv||"",
    cantidad:data.cantidad||"",
    hallazgo:data.hallazgo||"",
    decision:data.decision||"",
    photos: Array.isArray(data.photos) ? data.photos : []
  });
  renderProducts();
  renderFindings();
}
function removeProduct(i){
  products.splice(i,1);
  renderProducts();
  renderFindings();
}
function renderProducts(){
  const tbody = $("productsTable").querySelector("tbody");
  tbody.innerHTML = products.map((p,i)=>`
    <tr>
      <td style="text-align:center;font-weight:700">${itemLetter(i)}</td>
      <td><input data-p="${i}" data-k="producto" value="${esc(p.producto)}"></td>
      <td><input data-p="${i}" data-k="lote" value="${esc(p.lote)}"></td>
      <td><input data-p="${i}" data-k="fv" value="${esc(p.fv)}" placeholder="MM/AAAA"></td>
      <td><input data-p="${i}" data-k="cantidad" value="${esc(p.cantidad)}" type="number" min="0" step="any"></td>
      <td><button class="danger" onclick="removeProduct(${i})">×</button></td>
    </tr>`).join("");
  tbody.querySelectorAll("input").forEach(inp=>{
    inp.addEventListener("input",()=>products[+inp.dataset.p][inp.dataset.k]=inp.value);
  });
}
$("addProduct").addEventListener("click",()=>addProduct());

function renderFindings(){
  $("findings").innerHTML = products.map((p,i)=>`
    <div class="finding">
      <div class="item-title">ÍTEM ${itemLetter(i)} · ${esc(p.producto || "Producto pendiente")}</div>
      <div class="finding-body">
        <label>Descripción de los hallazgos
          <textarea data-h="${i}" placeholder="Describa el hallazgo correspondiente al ítem ${itemLetter(i)}">${esc(p.hallazgo)}</textarea>
        </label>
        <label style="margin-top:10px">Resultado del reclamo
          <select data-d="${i}">
            <option value="">Seleccione...</option>
            <option value="PROCEDE" ${p.decision==="PROCEDE"?"selected":""}>PROCEDE</option>
            <option value="NO PROCEDE" ${p.decision==="NO PROCEDE"?"selected":""}>NO PROCEDE</option>
          </select>
        </label>
        <div class="photo-area">
          <strong>Evidencia fotográfica del ítem ${itemLetter(i)}</strong>
          <div class="photo-actions">
            <button type="button" class="primary" onclick="openCamera(${i})">📷 Tomar foto</button>
            <button type="button" class="secondary" onclick="openGallery(${i})">🖼 Seleccionar foto</button>
            <input class="photo-input" id="camera-${i}" type="file" accept="image/*" capture="environment" onchange="handlePhoto(event,${i})">
            <input class="photo-input" id="gallery-${i}" type="file" accept="image/*" multiple onchange="handlePhoto(event,${i})">
          </div>
          <div class="photo-note">${p.photos.length} foto(s). Se comprimirán antes de subirlas a Google Drive.</div>
          <div class="photo-grid">
            ${p.photos.map((ph,j)=>`
              <div class="photo-card">
                <img src="${ph.dataUrl}" alt="Foto ${j+1} del ítem ${itemLetter(i)}">
                <button type="button" onclick="removePhoto(${i},${j})">Eliminar</button>
                <div class="photo-name">Foto ${j+1}</div>
              </div>`).join("")}
          </div>
        </div>
      </div>
    </div>`).join("");

  $("findings").querySelectorAll("textarea[data-h]").forEach(el=>{
    el.addEventListener("input",()=>products[+el.dataset.h].hallazgo=el.value);
  });
  $("findings").querySelectorAll("select[data-d]").forEach(el=>{
    el.addEventListener("change",()=>{
      products[+el.dataset.d].decision=el.value;
      autoConclusion();
    });
  });
}
function openCamera(i){ $("camera-"+i).click(); }
function openGallery(i){ $("gallery-"+i).click(); }
async function handlePhoto(e,i){
  const files=[...e.target.files];
  for(const file of files){
    try{
      const dataUrl=await compressImage(file,1800,0.82);
      products[i].photos.push({dataUrl,name:file.name||`foto_${Date.now()}.jpg`});
    }catch(err){ showError("No se pudo procesar una fotografía: "+err.message); }
  }
  e.target.value="";
  renderFindings();
}
function removePhoto(i,j){
  products[i].photos.splice(j,1);
  renderFindings();
}
function compressImage(file,maxSide=1800,quality=.82){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("No se pudo leer la imagen."));
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.naturalWidth,h=img.naturalHeight;
        const scale=Math.min(1,maxSide/Math.max(w,h));
        w=Math.round(w*scale); h=Math.round(h*scale);
        const c=document.createElement("canvas"); c.width=w;c.height=h;
        const ctx=c.getContext("2d");
        ctx.drawImage(img,0,0,w,h);
        resolve(c.toDataURL("image/jpeg",quality));
      };
      img.onerror=()=>reject(new Error("Imagen no válida."));
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function autoConclusion(){
  const decisions=products.map(p=>p.decision).filter(Boolean);
  if(!decisions.length){ $("conclusion").value=""; return; }
  $("conclusion").value=decisions.every(x=>x==="PROCEDE")?"PROCEDE":
    decisions.every(x=>x==="NO PROCEDE")?"NO PROCEDE":"";
}

function getData(){
  autoConclusion();
  return {
    nReporte:$("nReporte").value.trim(),
    fecha:$("fecha").value,
    cliente:$("cliente").value.trim(),
    rrcl:$("rrcl").value.trim(),
    fechaRecepcion:$("fechaRecepcion").value,
    fechaAtencion:$("fechaAtencion").value,
    factura:$("factura").value.trim(),
    vendedor:$("vendedor").value.trim(),
    descripcionReclamo:$("descripcionReclamo").value.trim(),
    productos:products.map((p,i)=>({
      item:itemLetter(i),producto:p.producto,lote:p.lote,fv:p.fv,cantidad:p.cantidad,
      hallazgo:p.hallazgo,decision:p.decision,
      photos:p.photos.map((x,j)=>({index:j+1,name:x.name,dataUrl:x.dataUrl}))
    })),
    destino:$("destino").value,
    conclusion:$("conclusion").value,
    accionCorrectiva:$("accionCorrectiva").value.trim(),
    preparadoPor:$("preparadoPor").value.trim(),
    aprobadoPor:$("aprobadoPor").value.trim()
  };
}

async function generateReport(){
  if(busy)return;
  const url=(window.APP_CONFIG?.APPS_SCRIPT_URL||"").trim();
  if(!url || url.includes("PEGAR_AQUI")) return showError("Primero debemos colocar la URL /exec de Google Apps Script.");
  if(!products.length) return showError("Agrega al menos un producto.");
  const data=getData();
  for(const [i,p] of products.entries()){
    if(!p.producto.trim()) return showError(`Completa el producto del ítem ${itemLetter(i)}.`);
    if(!p.hallazgo.trim()) return showError(`Completa el hallazgo del ítem ${itemLetter(i)}.`);
    if(!p.decision) return showError(`Selecciona PROCEDE o NO PROCEDE para el ítem ${itemLetter(i)}.`);
  }
  busy=true; $("generate").disabled=true;
  try{
    const reportKey = `${data.nReporte||"SIN_NUMERO"}_${Date.now()}`;
    const total=data.productos.reduce((n,p)=>n+p.photos.length,0);
    let done=0;
    for(const p of data.productos){
      for(const ph of p.photos){
        setProgress(`Subiendo foto ${++done} de ${total} · Ítem ${p.item}...`);
        const b64=ph.dataUrl.split(",")[1];
        const res=await postJSON(url,{action:"uploadPhoto",reportKey,item:p.item,index:ph.index,name:ph.name,base64:b64});
        if(!res.ok) throw new Error(res.error||"No se pudo subir una fotografía.");
        ph.fileId=res.fileId;
      }
    }
    setProgress("Generando el reporte PDF...");
    const clean={...data,reportKey};
    clean.productos=clean.productos.map(p=>({...p,photos:p.photos.map(ph=>({index:ph.index,name:ph.name,fileId:ph.fileId}))}));
    const result=await postJSON(url,{action:"generateReport",data:clean});
    if(!result.ok) throw new Error(result.error||"No se pudo generar el PDF.");
    $("progress").classList.add("hidden");
    $("result").innerHTML=`<div class="success"><b>Reporte generado correctamente.</b><br>
      <a href="${result.pdfUrl}" target="_blank" rel="noopener">Abrir / descargar PDF</a><br>
      <small>Las fotografías quedaron organizadas en Google Drive por reporte e ítem.</small></div>`;
  }catch(err){
    $("progress").classList.add("hidden");
    showError(err.message||String(err));
  }finally{
    busy=false;$("generate").disabled=false;
  }
}

async function postJSON(url,payload){
  const r=await fetch(url,{method:"POST",mode:"cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
  const text=await r.text();
  try{return JSON.parse(text)}catch(e){throw new Error("Respuesta no válida del servidor: "+text.slice(0,250));}
}
function setProgress(msg){$("progress").textContent=msg;$("progress").classList.remove("hidden");}
function showError(msg){$("result").innerHTML=`<div class="error">${esc(msg)}</div>`;}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

function draftObject(){return {...getData(),products};}
$("saveDraft").addEventListener("click",()=>{
  try{localStorage.setItem("reclamos_draft",JSON.stringify(draftObject()));$("status").textContent="Borrador guardado en este celular.";}
  catch(e){showError("No se pudo guardar el borrador. Las fotos no deben conservarse en localStorage.");}
});
$("loadDraft").addEventListener("click",()=>{
  const raw=localStorage.getItem("reclamos_draft");
  if(!raw)return showError("No hay borrador guardado.");
  try{loadData(JSON.parse(raw));$("status").textContent="Borrador cargado.";}
  catch(e){showError("El borrador no se pudo cargar.");}
});
$("clearDraft").addEventListener("click",()=>{
  if(confirm("¿Borrar el borrador guardado?")){localStorage.removeItem("reclamos_draft");$("status").textContent="Borrador borrado.";}
});
function loadData(d){
  ["nReporte","fecha","cliente","rrcl","fechaRecepcion","fechaAtencion","factura","vendedor","descripcionReclamo","destino","conclusion","accionCorrectiva","preparadoPor","aprobadoPor"].forEach(id=>{if(d[id]!==undefined)$(id).value=d[id]});
  products=(d.productos||[]).map(p=>({producto:p.producto||"",lote:p.lote||"",fv:p.fv||"",cantidad:p.cantidad||"",hallazgo:p.hallazgo||"",decision:p.decision||"",photos:p.photos||[]}));
  renderProducts();renderFindings();
}
$("generate").addEventListener("click",generateReport);
addProduct();
