import { Chart } from 'chart.js';
import JSZip from 'jszip';

export interface ArchivoDescarga {
  nombreArchivo: string;
  dataUrl: string;
}

export interface GraficaDescarga {
  canvasId: string;
  nombreArchivo: string;
}

function asegurarExtension(nombre: string, extension: string): string {
  const limpio = nombre.trim().replace(/[\\/:*?"<>|]+/g, '-');
  return limpio.toLowerCase().endsWith(`.${extension}`)
    ? limpio
    : `${limpio}.${extension}`;
}

export function descargarDataUrl(dataUrl: string, nombreArchivo: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = asegurarExtension(nombreArchivo, 'png');
  a.click();
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

export function descargarGraficaPorId(canvasId: string, nombreArchivo: string): boolean {
  const chart = obtenerChartPorCanvasId(canvasId);
  if (!chart) {
    return false;
  }
  descargarDataUrl(chartADataUrl(chart), nombreArchivo);
  return true;
}

export async function recopilarGraficas(
  items: GraficaDescarga[]
): Promise<ArchivoDescarga[]> {
  const archivos: ArchivoDescarga[] = [];
  for (const item of items) {
    const chart = obtenerChartPorCanvasId(item.canvasId);
    if (!chart) {
      continue;
    }
    archivos.push({
      nombreArchivo: asegurarExtension(item.nombreArchivo, 'png'),
      dataUrl: chartADataUrl(chart)
    });
  }
  return archivos;
}

export async function descargarGraficasZip(
  items: GraficaDescarga[],
  zipNombre: string
): Promise<void> {
  const archivos = await recopilarGraficas(items);
  await descargarArchivosZip(archivos, zipNombre);
}

export async function descargarArchivosZip(
  archivos: ArchivoDescarga[],
  zipNombre: string
): Promise<void> {
  if (!archivos.length) {
    return;
  }

  const zip = new JSZip();
  for (const archivo of archivos) {
    const base64 = archivo.dataUrl.includes(',')
      ? archivo.dataUrl.split(',')[1]
      : archivo.dataUrl;
    zip.file(asegurarExtension(archivo.nombreArchivo, 'png'), base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = asegurarExtension(zipNombre, 'zip');
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
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

export async function descargarSvgComoPng(
  svg: SVGSVGElement,
  nombreArchivo: string
): Promise<void> {
  const dataUrl = await svgADataUrl(svg);
  descargarDataUrl(dataUrl, nombreArchivo);
}

export function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
