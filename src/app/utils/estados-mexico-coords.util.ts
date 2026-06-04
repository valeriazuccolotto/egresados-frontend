import { ESTADOS_REPUBLICA_MEXICANA } from './estados-mexico.util';

/** Posición del pin en el SVG del mapa (viewBox 0 0 1000 650). */
export interface CoordenadaEstadoMapa {
  x: number;
  y: number;
}

export const COORDENADAS_ESTADOS_MAPA: Record<string, CoordenadaEstadoMapa> = {
  'Aguascalientes': { x: 480, y: 340 },
  'Baja California': { x: 150, y: 120 },
  'Baja California Sur': { x: 220, y: 280 },
  'Campeche': { x: 720, y: 420 },
  'Chiapas': { x: 780, y: 520 },
  'Chihuahua': { x: 400, y: 200 },
  'Ciudad de México': { x: 540, y: 380 },
  'Coahuila': { x: 520, y: 260 },
  'Colima': { x: 420, y: 430 },
  'Durango': { x: 460, y: 300 },
  'Guanajuato': { x: 500, y: 350 },
  'Guerrero': { x: 500, y: 470 },
  'Hidalgo': { x: 560, y: 360 },
  'Jalisco': { x: 440, y: 380 },
  'México': { x: 545, y: 395 },
  'Michoacán': { x: 460, y: 410 },
  'Morelos': { x: 540, y: 400 },
  'Nayarit': { x: 400, y: 360 },
  'Nuevo León': { x: 580, y: 280 },
  'Oaxaca': { x: 580, y: 480 },
  'Puebla': { x: 580, y: 390 },
  'Querétaro': { x: 520, y: 360 },
  'Quintana Roo': { x: 800, y: 400 },
  'San Luis Potosí': { x: 520, y: 330 },
  'Sinaloa': { x: 360, y: 300 },
  'Sonora': { x: 300, y: 200 },
  'Tabasco': { x: 700, y: 480 },
  'Tamaulipas': { x: 620, y: 320 },
  'Tlaxcala': { x: 565, y: 375 },
  'Veracruz': { x: 640, y: 410 },
  'Yucatán': { x: 780, y: 380 },
  'Zacatecas': { x: 470, y: 310 },
  'Extranjero': { x: 930, y: 325 }
};

const ALIAS_ESTADO: Record<string, string> = {
  cdmx: 'Ciudad de México',
  'ciudad de mexico': 'Ciudad de México',
  'distrito federal': 'Ciudad de México',
  'estado de mexico': 'México',
  mexico: 'México',
  'veracruz de ignacio de la llave': 'Veracruz',
  queretaro: 'Querétaro',
  michoacan: 'Michoacán',
  yucatan: 'Yucatán',
  'san luis potosi': 'San Luis Potosí',
  'nuevo leon': 'Nuevo León',
  extranjero: 'Extranjero',
  extrangero: 'Extranjero'
};

function claveNormalizada(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Devuelve el nombre canónico del estado o null si no se reconoce. */
export function resolverEstadoTrabajo(valor: string | null | undefined): string | null {
  if (!valor?.trim()) {
    return null;
  }
  const clave = claveNormalizada(valor);
  if (ALIAS_ESTADO[clave]) {
    return ALIAS_ESTADO[clave];
  }
  const encontrado = ESTADOS_REPUBLICA_MEXICANA.find(
    e => claveNormalizada(e) === clave
  );
  return encontrado ?? null;
}

export function obtenerCoordenadaEstado(estado: string): CoordenadaEstadoMapa | null {
  return COORDENADAS_ESTADOS_MAPA[estado] ?? null;
}
