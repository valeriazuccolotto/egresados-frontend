import { Chart } from 'chart.js';
import { jsPDF } from 'jspdf';

export interface GraficaDescarga {  canvasId: string;
  nombreArchivo: string;
  titulo: string;
  descripcion?: string;
}

export interface FilaGrafica {
  etiqueta: string;
  valor: number;
  porcentaje: number;
}

export interface PaginaPdfGrafica {
  titulo: string;
  descripcion?: string;
  imagenDataUrl: string;
  filas: FilaGrafica[];
}

export interface OpcionDescargaPdf {
  id: string;
  titulo: string;
  descripcion?: string;
}

function asegurarExtension(nombre: string, extension: string): string {
  const limpio = nombre.trim().replace(/[\\/:*?"<>|]+/g, '-');
  return limpio.toLowerCase().endsWith(`.${extension}`)
    ? limpio
    : `${limpio}.${extension}`;
}

let fuentePdfUnicodeLista = false;

async function cargarFuentePdfUnicode(doc: jsPDF): Promise<boolean> {
  if (fuentePdfUnicodeLista) {
    return true;
  }
  try {
    const respuesta = await fetch(
      'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
    );
    if (!respuesta.ok) {
      return false;
    }
    const buffer = await respuesta.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binario = '';
    for (let i = 0; i < bytes.length; i++) {
      binario += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binario);
    doc.addFileToVFS('NotoSans-Regular.ttf', base64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'bold');
    fuentePdfUnicodeLista = true;
    return true;
  } catch {
    return false;
  }
}

function aplicarFuentePdf(doc: jsPDF, estilo: 'normal' | 'bold', unicode: boolean): void {
  if (unicode) {
    doc.setFont('NotoSans', estilo);
    return;
  }
  doc.setFont('helvetica', estilo);
}

export function obtenerChartPorCanvasId(canvasId: string): Chart | undefined {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) {
    return undefined;
  }
  return Chart.getChart(canvas);
}

export function chartADataUrl(chart: Chart): string {
  return chart.toBase64Image('image/png', 1);
}

export function datosTablaDesdeChart(chart: Chart): FilaGrafica[] {
  const labels = (chart.data.labels || []).map(l => String(l ?? ''));
  const dataset = chart.data.datasets?.[0];
  const values = (dataset?.data || []).map(v => Number(v) || 0);
  const total = values.reduce((a, b) => a + b, 0);

  return labels.map((etiqueta, i) => {
    const valor = values[i] ?? 0;
    return {
      etiqueta,
      valor,
      porcentaje: total > 0 ? (valor / total) * 100 : 0
    };
  });
}

function aplicarEstilosComputados(origen: Element, destino: Element): void {
  const estilo = window.getComputedStyle(origen);
  const fill = estilo.fill;
  const stroke = estilo.stroke;
  const strokeWidth = estilo.strokeWidth;
  const opacity = estilo.opacity;
  const fontFamily = estilo.fontFamily;
  const fontSize = estilo.fontSize;
  const fontWeight = estilo.fontWeight;
  const color = estilo.color;

  if (fill && fill !== 'none') {
    (destino as SVGElement).setAttribute('fill', fill);
  }
  if (stroke && stroke !== 'none') {
    (destino as SVGElement).setAttribute('stroke', stroke);
  }
  if (strokeWidth) {
    (destino as SVGElement).setAttribute('stroke-width', strokeWidth);
  }
  if (opacity && opacity !== '1') {
    (destino as SVGElement).setAttribute('opacity', opacity);
  }
  if (destino.tagName.toLowerCase() === 'text') {
    if (fontFamily) {
      (destino as SVGElement).setAttribute('font-family', fontFamily);
    }
    if (fontSize) {
      (destino as SVGElement).setAttribute('font-size', fontSize);
    }
    if (fontWeight) {
      (destino as SVGElement).setAttribute('font-weight', fontWeight);
    }
    if (color && color !== 'rgba(0, 0, 0, 0)') {
      (destino as SVGElement).setAttribute('fill', color);
    }
  }

  const hijosOrigen = Array.from(origen.children);
  const hijosDestino = Array.from(destino.children);
  hijosOrigen.forEach((hijo, index) => {
    if (hijosDestino[index]) {
      aplicarEstilosComputados(hijo, hijosDestino[index]);
    }
  });
}

export async function svgADataUrl(svg: SVGSVGElement): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  aplicarEstilosComputados(svg, clone);

  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const viewBox = svg.viewBox?.baseVal;
  const width = viewBox?.width || svg.clientWidth || 1000;
  const height = viewBox?.height || svg.clientHeight || 650;
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  const xml = new XMLSerializer().serializeToString(clone);
  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo crear el canvas'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png', 1));
    };
    img.onerror = () => reject(new Error('No se pudo convertir el SVG'));
    img.src = svgUrl;
  });
}

const SEPARADOR_CSV = '\t';

function escaparCeldaCsv(valor: unknown): string {
  const texto = String(valor ?? '');
  if (/[\t"\r\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/** UTF-16 LE con tabulador: Excel en Windows separa columnas y respeta acentos. */
function crearBlobCsvExcel(lineas: string[]): Blob {
  const contenido = lineas.join('\r\n');
  const bytes = new Uint8Array(contenido.length * 2 + 2);
  bytes[0] = 0xff;
  bytes[1] = 0xfe;
  for (let i = 0; i < contenido.length; i++) {
    const code = contenido.charCodeAt(i);
    bytes[i * 2 + 2] = code & 0xff;
    bytes[i * 2 + 3] = (code >> 8) & 0xff;
  }
  return new Blob([bytes], { type: 'text/csv;charset=utf-16le' });
}

function descargarBlobCsv(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = asegurarExtension(nombreArchivo, 'csv');
  enlace.click();
  URL.revokeObjectURL(url);
}

export function descargarCsv(filas: FilaGrafica[], nombreArchivo: string, titulo?: string): void {
  const sep = SEPARADOR_CSV;
  const lineas = [`Categoría${sep}Cantidad${sep}Porcentaje`];
  if (titulo) {
    lineas.unshift(`# ${titulo.replace(/\t/g, ' ')}`);
  }
  for (const fila of filas) {
    lineas.push(
      `${escaparCeldaCsv(fila.etiqueta)}${sep}${fila.valor}${sep}${fila.porcentaje.toFixed(1)}%`
    );
  }
  descargarBlobCsv(crearBlobCsvExcel(lineas), nombreArchivo);
}

/** Exporta filas arbitrarias a CSV compatible con Excel (UTF-16, columnas por tabulador). */
export function descargarCsvFilas(
  encabezados: string[],
  filas: unknown[][],
  nombreArchivo: string
): void {
  const sep = SEPARADOR_CSV;
  const lineas = [
    encabezados.map(escaparCeldaCsv).join(sep),
    ...filas.map(fila => fila.map(escaparCeldaCsv).join(sep))
  ];
  descargarBlobCsv(crearBlobCsvExcel(lineas), nombreArchivo);
}

function dibujarPagina(
  doc: jsPDF,
  pagina: PaginaPdfGrafica,
  esPrimera: boolean,
  unicode: boolean
): void {
  if (!esPrimera) {
    doc.addPage();
  }

  const margen = 16;
  const anchoUtil = doc.internal.pageSize.getWidth() - margen * 2;
  let y = margen;

  aplicarFuentePdf(doc, 'bold', unicode);
  doc.setFontSize(16);
  doc.setTextColor(47, 143, 131);
  const tituloLineas = doc.splitTextToSize(pagina.titulo, anchoUtil);
  doc.text(tituloLineas, margen, y + 4);
  y += tituloLineas.length * 7 + 4;

  if (pagina.descripcion) {
    aplicarFuentePdf(doc, 'normal', unicode);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const descLineas = doc.splitTextToSize(pagina.descripcion, anchoUtil);
    doc.text(descLineas, margen, y);
    y += descLineas.length * 5 + 6;
  } else {
    y += 4;
  }

  const altoImgMax = 120;
  const props = doc.getImageProperties(pagina.imagenDataUrl);
  const ratio = props.width / Math.max(props.height, 1);
  let imgW = anchoUtil;
  let imgH = imgW / ratio;
  if (imgH > altoImgMax) {
    imgH = altoImgMax;
    imgW = imgH * ratio;
  }
  const imgX = margen + (anchoUtil - imgW) / 2;
  doc.addImage(pagina.imagenDataUrl, 'PNG', imgX, y, imgW, imgH);
  y += imgH + 10;

  aplicarFuentePdf(doc, 'bold', unicode);
  doc.setFontSize(11);
  doc.setTextColor(32, 79, 75);
  doc.text('Datos de la gráfica', margen, y);
  y += 7;

  const colEtiqueta = margen;
  const colValor = margen + anchoUtil * 0.62;
  const colPct = margen + anchoUtil * 0.82;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Categoría', colEtiqueta, y);
  doc.text('Cantidad', colValor, y);
  doc.text('%', colPct, y);
  y += 2;
  doc.setDrawColor(226, 236, 233);
  doc.line(margen, y, margen + anchoUtil, y);
  y += 6;

  aplicarFuentePdf(doc, 'normal', unicode);
  doc.setTextColor(51, 65, 85);
  const altoPagina = doc.internal.pageSize.getHeight();

  for (const fila of pagina.filas) {
    if (y > altoPagina - 20) {
      doc.addPage();
      y = margen;
      aplicarFuentePdf(doc, 'bold', unicode);
      doc.setFontSize(11);
      doc.setTextColor(32, 79, 75);
      doc.text('Datos de la gráfica (continuación)', margen, y);
      y += 8;
      aplicarFuentePdf(doc, 'normal', unicode);
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
    }

    const etiquetaLineas = doc.splitTextToSize(fila.etiqueta || 'Sin etiqueta', anchoUtil * 0.55);
    doc.text(etiquetaLineas, colEtiqueta, y);
    doc.text(String(fila.valor), colValor, y);
    doc.text(`${fila.porcentaje.toFixed(1)}%`, colPct, y);
    y += Math.max(etiquetaLineas.length * 4.5, 6) + 1;
  }

  const total = pagina.filas.reduce((a, f) => a + f.valor, 0);
  y += 3;
  doc.setDrawColor(226, 236, 233);
  doc.line(margen, y, margen + anchoUtil, y);
  y += 6;
  aplicarFuentePdf(doc, 'bold', unicode);
  doc.text('Total', colEtiqueta, y);
  doc.text(String(total), colValor, y);
  doc.text('100%', colPct, y);
}

export async function generarPdfGraficas(
  paginas: PaginaPdfGrafica[],
  nombreArchivo: string
): Promise<void> {
  if (!paginas.length) {
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const unicode = await cargarFuentePdfUnicode(doc);
  for (let index = 0; index < paginas.length; index++) {
    dibujarPagina(doc, paginas[index], index === 0, unicode);    if (index < paginas.length - 1) {
      await esperar(0);
    }
  }
  doc.save(asegurarExtension(nombreArchivo, 'pdf'));
}

export async function descargarGraficaPdfPorId(
  canvasId: string,
  titulo: string,
  nombreArchivo: string,
  descripcion?: string
): Promise<boolean> {
  const chart = obtenerChartPorCanvasId(canvasId);
  if (!chart) {
    return false;
  }

  await generarPdfGraficas(
    [{
      titulo,
      descripcion,
      imagenDataUrl: chartADataUrl(chart),
      filas: datosTablaDesdeChart(chart)
    }],
    nombreArchivo
  );
  return true;
}

export async function descargarGraficaCsvPorId(
  canvasId: string,
  titulo: string,
  nombreArchivo: string
): Promise<boolean> {
  const chart = obtenerChartPorCanvasId(canvasId);
  if (!chart) {
    return false;
  }
  descargarCsv(datosTablaDesdeChart(chart), nombreArchivo, titulo);
  return true;
}

export async function descargarGraficasPdf(
  items: GraficaDescarga[],
  nombreArchivo: string
): Promise<void> {
  const paginas: PaginaPdfGrafica[] = [];

  for (const item of items) {
    const chart = obtenerChartPorCanvasId(item.canvasId);
    if (!chart) {
      continue;
    }
    paginas.push({
      titulo: item.titulo,
      descripcion: item.descripcion,
      imagenDataUrl: chartADataUrl(chart),
      filas: datosTablaDesdeChart(chart)
    });
    await esperar(0);
  }

  await generarPdfGraficas(paginas, nombreArchivo);
}

export async function descargarImagenPdf(
  imagenDataUrl: string,
  titulo: string,
  nombreArchivo: string,
  descripcion?: string,
  filas: FilaGrafica[] = []
): Promise<void> {
  await generarPdfGraficas(
    [{ titulo, descripcion, imagenDataUrl, filas }],
    nombreArchivo
  );
}

export async function descargarImagenCsv(
  titulo: string,
  nombreArchivo: string,
  filas: FilaGrafica[] = []
): Promise<void> {
  descargarCsv(filas, nombreArchivo, titulo);
}

export function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
