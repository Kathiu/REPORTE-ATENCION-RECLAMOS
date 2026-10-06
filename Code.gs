const ROOT_FOLDER_NAME = "REPORTES_RECLAMOS";

const PREPARADO_POR_FIJO = "Ing. Katherine Correa Palacios";
const APROBADO_POR_FIJO = "Mblgo. Isaias Castillo B.";

// Membrete original F-PR-AC-14.2, incorporado como imagen fija.
// Se usa la imagen original proporcionada por el usuario para evitar
// diferencias de alineación, bordes, tipografía o proporciones.
const MEMBRETE_RECLAMOS_BASE64 = "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";

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok:true,
    service:"REPORTE_ATENCION_RECLAMOS",
    version:"1.4"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (body.action === "uploadPhoto") return json_(uploadPhoto_(body));
    if (body.action === "generateReport") return json_(generateReport_(body.data || {}));
    return json_({ok:false,error:"Acción no reconocida."});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function uploadPhoto_(p) {
  if (!p.reportKey || !p.item || !p.base64) throw new Error("Faltan datos para subir la fotografía.");
  const root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
  const year = String(new Date().getFullYear());
  const yearFolder = getOrCreateFolder_(root, year);
  const reportFolder = getOrCreateFolder_(yearFolder, safe_(p.reportKey));
  const itemFolder = getOrCreateFolder_(reportFolder, "ITEM_" + safe_(p.item));

  const bytes = Utilities.base64Decode(p.base64);
  const blob = Utilities.newBlob(bytes, "image/jpeg", safe_(p.item) + "_Foto_" + String(p.index || 1) + ".jpg");
  const file = itemFolder.createFile(blob);
  file.setDescription("Evidencia fotográfica - Reporte de Reclamos - Ítem " + p.item);
  return {ok:true,fileId:file.getId(),fileName:file.getName()};
}

function generateReport_(d) {
  if (!d.reportKey) throw new Error("Falta el identificador del reporte.");
  const root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
  const yearFolder = getOrCreateFolder_(root, String(new Date().getFullYear()));
  const reportFolder = getOrCreateFolder_(yearFolder, safe_(d.reportKey));

  const title = "Reporte de Atención de Reclamos - " + (d.nReporte || d.reportKey);
  const doc = DocumentApp.create(title);
  const body = doc.getBody();
  body.setMarginTop(32); body.setMarginBottom(32); body.setMarginLeft(36); body.setMarginRight(36);

  addHeader_(body, d);
  addGeneralData_(body, d);
  addProductsTable_(body, d.productos || []);
  addFindings_(body, d.productos || []);
  addClosing_(body, d);

  doc.saveAndClose();

  const docFile = DriveApp.getFileById(doc.getId());
  reportFolder.addFile(docFile);
  DriveApp.getRootFolder().removeFile(docFile);

  const pdfBlob = docFile.getAs(MimeType.PDF).setName(title + ".pdf");
  const pdfFile = reportFolder.createFile(pdfBlob);

  return {ok:true,pdfUrl:pdfFile.getUrl(),pdfFileId:pdfFile.getId(),reportFolderUrl:reportFolder.getUrl()};
}

function addHeader_(body,d){
  // =========================================================
  // MEMBRETE FIJO ORIGINAL
  // =========================================================
  // No se reconstruye con tablas ni textos. Se inserta la imagen
  // completa del membrete original para conservar exactamente su
  // distribución, líneas, logotipo, textos y proporciones.
  try {
    const blob = Utilities.newBlob(
      Utilities.base64Decode(MEMBRETE_RECLAMOS_BASE64),
      MimeType.JPEG,
      "MEMBRETE_F-PR-AC-14.2.jpg"
    );

    const img = body.appendImage(blob);

    // El archivo ya fue preparado a 520 x 110 px para ocupar el ancho
    // útil de la página A4 con los márgenes actuales, sin deformarlo.
    const targetWidth = 520;
    const originalWidth = img.getWidth();
    const originalHeight = img.getHeight();

    if (originalWidth !== targetWidth) {
      const ratio = targetWidth / originalWidth;
      img.setWidth(targetWidth);
      img.setHeight(Math.round(originalHeight * ratio));
    }

    try {
      img.getParent().asParagraph()
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    } catch(e) {}

  } catch (err) {
    throw new Error("No se pudo insertar el membrete fijo original: " + String(err));
  }

  // Separación mínima entre el membrete y el contenido del reporte.
  const sep = body.appendParagraph("");
  sep.setSpacingAfter(2);
}

function addGeneralData_(body,d){
  const rows=[
    ["1. N° Reporte",d.nReporte||"", "2. Fecha",formatDate_(d.fecha)],
    ["3. Cliente",d.cliente||"", "4. N° Reporte de reclamo (RRCL Ventas)",d.rrcl||""],
    ["5. Fecha de recepción de reclamo",formatDate_(d.fechaRecepcion), "6. Fecha de atención de reclamo (AC)",formatDate_(d.fechaAtencion)],
    ["7. N° de factura",d.factura||"", "8. Vendedor",d.vendedor||""],
    ["9-10. Producto / Cantidad","Ver tabla de productos", "11. Descripción del reclamo",d.descripcionReclamo||""]
  ];
  const t=body.appendTable(rows);
  styleTable_(t,"#F4F7FB");
  for(let r=0;r<t.getNumRows();r++){
    t.getCell(r,0).setBackgroundColor("#EAF0F8");
    t.getCell(r,2).setBackgroundColor("#EAF0F8");
    t.getCell(r,0).getChild(0).asParagraph().setBold(true);
    t.getCell(r,2).getChild(0).asParagraph().setBold(true);
  }
  body.appendParagraph("");
}

function addProductsTable_(body,products){
  const h=body.appendParagraph("PRODUCTOS INVOLUCRADOS");
  h.setBold(true).setForegroundColor("#17365D");
  const rows=[["ÍTEM","PRODUCTO","LOTE","FV","CANTIDAD"]];
  products.forEach(p=>rows.push([p.item||"",p.producto||"",p.lote||"",p.fv||"",String(p.cantidad||"")]));
  const t=body.appendTable(rows);
  styleTable_(t,"#FFFFFF");
  for(let c=0;c<5;c++){
    t.getCell(0,c).setBackgroundColor("#17365D").setForegroundColor("#FFFFFF");
    t.getCell(0,c).getChild(0).asParagraph().setBold(true);
  }
  body.appendParagraph("");
}

function addFindings_(body,products){
  const h=body.appendParagraph("12. DESCRIPCIÓN DE LOS HALLAZGOS");
  h.setBold(true).setForegroundColor("#17365D");
  products.forEach(p=>{
    const title=body.appendParagraph((p.item||"")+". "+(p.producto||""));
    title.setBold(true).setForegroundColor("#2F5597");
    body.appendParagraph(p.hallazgo||"");
    const decision=body.appendParagraph("EL RECLAMO "+(p.decision||""));
    decision.setBold(true).setForegroundColor(p.decision==="PROCEDE"?"#2E7D32":"#C62828");
    addPhotos_(body,p);
  });
}

function addPhotos_(body,p){
  const photos=p.photos||[];
  if(!photos.length)return;
  const h=body.appendParagraph("EVIDENCIA FOTOGRÁFICA · ÍTEM "+(p.item||""));
  h.setBold(true).setForegroundColor("#17365D");
  const rows=[];
  for(let i=0;i<photos.length;i+=2){
    const row=[];
    for(let j=0;j<2;j++){
      const ph=photos[i+j];
      row.push(ph ? "Foto "+(ph.index||i+j+1) : "");
    }
    rows.push(row);
  }
  const t=body.appendTable(rows);
  t.setBorderColor("#9AA9BF");
  for(let i=0;i<photos.length;i++){
    const r=Math.floor(i/2),c=i%2,ph=photos[i];
    const cell=t.getCell(r,c);
    cell.clear();
    const par=cell.appendParagraph();
    par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    try{
      const file=DriveApp.getFileById(ph.fileId);
      const img=par.appendInlineImage(file.getBlob());
      const maxW=220;
      const w=img.getWidth(),hgt=img.getHeight();
      if(w>maxW){img.setWidth(maxW);img.setHeight(Math.round(hgt*maxW/w));}
      const cap=cell.appendParagraph("Foto "+(ph.index||i+1));
      cap.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setFontSize(9).setForegroundColor("#64748B");
    }catch(err){
      cell.appendParagraph("No se pudo cargar la foto: "+String(err));
    }
  }
  body.appendParagraph("");
}

function addClosing_(body,d){
  const h=body.appendParagraph("13. DESTINO DEL PRODUCTO");
  h.setBold(true).setForegroundColor("#17365D");
  body.appendParagraph(d.destino||"");
  const h2=body.appendParagraph("14. CONCLUSIÓN");
  h2.setBold(true).setForegroundColor("#17365D");
  body.appendParagraph(d.conclusion||"");
  const h3=body.appendParagraph("15. ACCIÓN CORRECTIVA");
  h3.setBold(true).setForegroundColor("#17365D");
  body.appendParagraph(d.accionCorrectiva||"");
  body.appendParagraph("");
  const sig=body.appendTable([
    ["PREPARADO POR","APROBADO POR"],
    [PREPARADO_POR_FIJO,APROBADO_POR_FIJO],
    ["Firma / fecha","Firma / fecha"]
  ]);
  styleTable_(sig,"#F4F7FB");
  sig.getCell(0,0).getChild(0).asParagraph().setBold(true);
  sig.getCell(0,1).getChild(0).asParagraph().setBold(true);
}

function styleTable_(t,bg){
  t.setBorderColor("#9AA9BF");
  for(let r=0;r<t.getNumRows();r++)for(let c=0;c<t.getRow(r).getNumCells();c++){
    t.getCell(r,c).setBackgroundColor(bg);
  }
}

function getOrCreateFolder_(parent,name){
  const it=parent.getFoldersByName(name);
  return it.hasNext()?it.next():parent.createFolder(name);
}
function safe_(s){return String(s||"").replace(/[\\\/:*?"<>|#%{}]/g,"_").slice(0,120);}
function formatDate_(s){
  if(!s)return "";
  const p=String(s).split("-");
  return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:String(s);
}
function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}