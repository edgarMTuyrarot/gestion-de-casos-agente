function doGet() {
  var html = HtmlService.createTemplateFromFile('index')
  var output = html.evaluate()
  return output.addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setFaviconUrl(`https://cdn-icons-png.flaticon.com/512/5261/5261327.png`)
    .setTitle("Gestion de Casos").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}


function usuarioNomina(u) {
  let agente = {
    "nombre": "",
    "supervisor": ""
  }
  var ss = SpreadsheetApp.openById("--");
  var data = ss.getSheetByName("Nomina Cable")
  var datos = data.getDataRange().getDisplayValues()
  datos.forEach(function (fila) {
    if (fila[0] == u.toUpperCase()) {
      agente = { "nombre": fila[1], "supervisor": fila[5] }
      //Logger.log(agente)
    }
  })

  return agente
}

function metricas(agente) {
  var tablaTMO = SpreadsheetApp.openById("--").getRangeByName("TMO").getValues();
  var tablaFCR = SpreadsheetApp.openById("--").getRangeByName("FCR").getValues();
  var tablaNPS = SpreadsheetApp.openById("--").getRangeByName("NPS").getValues();
  var tablaReten = SpreadsheetApp.openById("--").getRangeByName("Reten").getValues();
  let objAgente = {
    "nombre": agente,
    "tmo":"Sin Datos",
    "fcr":"Sin Datos",
    "nps":"Sin Datos",
    "reten":"Sin Datos"
  }
  tablaTMO.forEach(fila => {
    if (fila[0] == agente) {
      objAgente.tmo = fila[5]

    }
  })
  tablaFCR.forEach(fila => {
    if (fila[0] == agente) {
      objAgente.fcr = `${(fila[3]*100).toFixed(2)}%`

    }
  })
  tablaNPS.forEach(fila => {
    if (fila[0] == agente) {
      objAgente.nps = `${(fila[4]*100).toFixed(2)}%`

    } 
  })
  tablaReten.forEach(fila => {
    if (fila[0] == agente) {
      objAgente.reten = `${(fila[3]*100).toFixed(2)}%`

    } 
  })

 

  return objAgente

}



function traerRegistros() {
  var resultados = itrackers.traerRegistros()
  return resultados
}


function subirArchivo(obj, sup) {
  let id = identificarCarpeta(sup)
  Logger.log(id)
  var file = Utilities.newBlob(obj.bytes, obj.mimeType, obj.filename);
  var folder = DriveApp.getFolderById(id)
  var createFile = folder.createFile(file);
  var link = createFile.getUrl()
  var linkDescargar = createFile.getDownloadUrl()
  var datos = { "url": link, "descarga": linkDescargar }
  return datos
}

function identificarCarpeta(nombre) {
  var carpetaRaiz = DriveApp.getFolderById("--")
  var carpeta = carpetaRaiz.getFoldersByName(nombre)
  var idCarpeta
  while (carpeta.hasNext()) {
    var folder = carpeta.next();
    idCarpeta = folder.getId();
    return idCarpeta

  }
  var nuevaCarpeta = carpetaRaiz.createFolder(nombre);
  idCarpeta = nuevaCarpeta.getId();
  return idCarpeta

}

function guardarRegistro(datos) {

  var libro = SpreadsheetApp.getActiveSpreadsheet()
  //var libro = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/--/edit#gid=0")
  var ss = libro.getSheetByName("datos");

  datos.estado = "Pendiente"
  datos.ticket = "-"
  datos.fecha = new Date().toLocaleString('es-ar', { weekday: "short", month: "short", day: "numeric"})
  ss.appendRow([JSON.stringify(datos)]);



  return
}