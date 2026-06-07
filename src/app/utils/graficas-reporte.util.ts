/** Utilidades compartidas para gráficas de reportes (admin). */

export function normalizarTextoReporte(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .trim();
}

export function contarPorCampo(
  datos: any[],
  campo: string,
  etiquetas: readonly string[]
): number[] {
  return etiquetas.map(etiqueta =>
    datos.filter(item =>
      normalizarTextoReporte(item?.[campo]) === normalizarTextoReporte(etiqueta)
    ).length
  );
}

export const ETIQUETAS_SECTOR_LABORAL = [
  'Tecnológico',
  'Industria',
  'Agrícola',
  'Educación',
  'Servicios',
  'Otro'
] as const;

export const ETIQUETAS_COMO_CONSIGUIO = [
  'Bolsa de trabajo',
  'Internet',
  'Recomendación',
  'Entrevista'
] as const;

export const ETIQUETAS_TIEMPO_EMPLEO = [
  'Menos de 3 meses',
  '3-6 meses',
  '6-12 meses',
  'Más de un año'
] as const;

export const ETIQUETAS_TIPO_CONTRATO = [
  'Tiempo completo',
  'Freelance'
] as const;

export const ETIQUETAS_MODALIDAD_LABORAL = [
  'Presencial',
  'Remoto',
  'Híbrido'
] as const;

export const ETIQUETAS_SALARIO = [
  '$5,000 - $12,000',
  '$12,000 - $20,000',
  '$20,000 - $30,000',
  'Más de $30,000',
  'Prefiero no responder'
] as const;

export const ETIQUETAS_RELACION_CARRERA_LABORAL = [
  'Totalmente relacionada',
  'Parcialmente relacionada',
  'Poco relacionada',
  'Totalmente diferente'
] as const;

export const ETIQUETAS_NIVEL_POSGRADO = [
  'Maestria',
  'Doctorado'
] as const;

export const ETIQUETAS_MODALIDAD_POSGRADO = [
  'Presencial',
  'Virtual',
  'Hibrida'
] as const;

export const ETIQUETAS_ESTATUS_POSGRADO = [
  'En curso',
  'Finalizado',
  'Pausado'
] as const;

export const ETIQUETAS_RELACION_POSGRADO = [
  'Si',
  'No',
  'Un poco'
] as const;

export const ETIQUETAS_TIPO_RECONOCIMIENTO = [
  'Académico',
  'Cultural',
  'Deportivo'
] as const;

export const ETIQUETAS_TIPO_TITULACION = [
  'Tesis',
  'CENEVAL',
  'Promedio',
  'Experiencia laboral'
] as const;

export const ETIQUETAS_TIPO_TITULACION_CORTAS = [
  'Tesis',
  'CENEVAL',
  'Promedio',
  'Exp. Laboral'
] as const;

export const PALETA_GRAFICAS = [
  '#2f8f83',
  '#52b0a4',
  '#85cdc6',
  '#1a6e78',
  '#9eaab3',
  '#c8d0d5'
] as const;

export function coloresGrafica(cantidad: number): string[] {
  return Array.from({ length: cantidad }, (_, index) =>
    PALETA_GRAFICAS[index % PALETA_GRAFICAS.length]
  );
}
