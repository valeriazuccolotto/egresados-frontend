import { resolverEstadoTrabajo } from './estados-mexico-coords.util';

export interface MexicoGeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties?: Record<string, string | undefined>;
}

export interface MexicoGeoCollection {
  type: 'FeatureCollection';
  features: MexicoGeoFeature[];
}

export interface EstadoMapaSvg {
  estado: string;
  d: string;
  centroid: { x: number; y: number };
}

/** Límites aproximados de México para proyectar lon/lat al viewBox del SVG. */
const BOUNDS = {
  minLon: -118.45,
  maxLon: -86.65,
  minLat: 14.52,
  maxLat: 32.75,
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

function geometryToPath(geometry: MexicoGeoFeature['geometry']): string {
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

/** Convierte el GeoJSON de México (amCharts mexicoLow) en paths SVG por estado. */
export function geoJsonAMapasEstados(geo: MexicoGeoCollection): EstadoMapaSvg[] {
  const estados: EstadoMapaSvg[] = [];

  for (const feature of geo.features) {
    const nombreRaw = feature.properties?.['name'] as string | undefined;
    const estado = resolverEstadoTrabajo(nombreRaw ?? '');
    if (!estado || estado === 'Extranjero') {
      continue;
    }
    const d = geometryToPath(feature.geometry);
    if (!d) {
      continue;
    }
    estados.push({
      estado,
      d,
      centroid: centroidFromPath(d)
    });
  }

  return estados.sort((a, b) => a.estado.localeCompare(b.estado, 'es'));
}

export function conteoPorEstadoDesdeMarcadores(
  marcadores: { estado: string; egresados: unknown[] }[]
): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const m of marcadores) {
    conteo[m.estado] = m.egresados.length;
  }
  return conteo;
}
