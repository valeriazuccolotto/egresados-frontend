import { normalizarTextoReporte } from './graficas-reporte.util';

export interface OaxacaGeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties?: { nombre?: string };
}

export interface OaxacaGeoCollection {
  type: 'FeatureCollection';
  features: OaxacaGeoFeature[];
}

export interface MunicipioMapaSvg {
  municipio: string;
  d: string;
  centroid: { x: number; y: number };
}

const BOUNDS = {
  minLon: -98.85,
  maxLon: -93.85,
  minLat: 15.55,
  maxLat: 18.95,
  width: 1000,
  height: 650
};

function project(lon: number, lat: number): { x: number; y: number } {
  const x =
    ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * BOUNDS.width;
  const y =
    ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * BOUNDS.height;
  return { x, y };
}

function ringToPath(ring: number[][]): string {
  if (!ring.length) {
    return '';
  }
  return (
    ring
      .map((coord, index) => {
        const { x, y } = project(coord[0], coord[1]);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ') + ' Z'
  );
}

function polygonToPath(coords: number[][][]): string {
  return coords.map(ring => ringToPath(ring)).join(' ');
}

function geometryToPath(geometry: OaxacaGeoFeature['geometry']): string {
  if (geometry.type === 'Polygon') {
    return polygonToPath(geometry.coordinates as number[][][]);
  }
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][])
      .map(poly => polygonToPath(poly))
      .join(' ');
  }
  return '';
}

function centroidFromPath(d: string): { x: number; y: number } {
  const nums = d.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
  if (nums.length < 4) {
    return { x: BOUNDS.width / 2, y: BOUNDS.height / 2 };
  }
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < nums.length; i += 2) {
    xs.push(nums[i]);
    ys.push(nums[i + 1] ?? 0);
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

export function geoJsonAMapasMunicipios(geo: OaxacaGeoCollection): MunicipioMapaSvg[] {
  const municipios: MunicipioMapaSvg[] = [];

  for (const feature of geo.features) {
    const nombre = feature.properties?.nombre?.trim();
    if (!nombre) {
      continue;
    }
    const d = geometryToPath(feature.geometry);
    if (!d) {
      continue;
    }
    municipios.push({
      municipio: nombre,
      d,
      centroid: centroidFromPath(d)
    });
  }

  return municipios.sort((a, b) => a.municipio.localeCompare(b.municipio, 'es'));
}

export function resolverMunicipioOaxaca(
  valor: unknown,
  catalogo: Iterable<string>
): string | null {
  const texto = String(valor ?? '').trim();
  if (!texto) {
    return null;
  }
  const normalizado = normalizarTextoReporte(texto);
  for (const municipio of catalogo) {
    if (normalizarTextoReporte(municipio) === normalizado) {
      return municipio;
    }
  }
  return texto;
}

export function conteoPorMunicipioDesdeMarcadores(
  marcadores: { municipio: string; egresados: unknown[] }[]
): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const m of marcadores) {
    conteo[m.municipio] = m.egresados.length;
  }
  return conteo;
}
