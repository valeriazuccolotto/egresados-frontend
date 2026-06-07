function normalizarPrestacion(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function datosGraficaPrestaciones(
  catalogo: Array<{ nombre?: string }>,
  laborales: any[]
): { labels: string[]; values: number[] } {
  const etiquetasConocidas = new Set<string>();
  const labels: string[] = [];

  for (const item of catalogo) {
    const nombre = String(item?.nombre ?? '').trim();
    if (!nombre) {
      continue;
    }
    const clave = normalizarPrestacion(nombre);
    if (!etiquetasConocidas.has(clave)) {
      etiquetasConocidas.add(clave);
      labels.push(nombre);
    }
  }

  const extras: string[] = [];
  for (const laboral of laborales) {
    for (const prestacion of laboral?.prestaciones ?? []) {
      const nombre = String(prestacion?.nombre ?? '').trim();
      if (!nombre) {
        continue;
      }
      const clave = normalizarPrestacion(nombre);
      if (!etiquetasConocidas.has(clave)) {
        etiquetasConocidas.add(clave);
        extras.push(nombre);
      }
    }
  }

  extras.sort((a, b) => a.localeCompare(b, 'es'));
  const todasLasEtiquetas = [...labels, ...extras];

  const pares = todasLasEtiquetas.map(label => ({
    label,
    value: laborales.filter(laboral =>
      (laboral?.prestaciones ?? []).some(
        (prestacion: { nombre?: string }) =>
          normalizarPrestacion(prestacion?.nombre) === normalizarPrestacion(label)
      )
    ).length
  }));

  pares.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'es'));

  return {
    labels: pares.map(par => par.label),
    values: pares.map(par => par.value)
  };
}

export const PALETA_PRESTACIONES = [
  '#2f8f83',
  '#52b0a4',
  '#85cdc6',
  '#1a6e78',
  '#9eaab3',
  '#c8d0d5'
];

export function coloresPrestaciones(cantidad: number): string[] {
  return Array.from({ length: cantidad }, (_, index) =>
    PALETA_PRESTACIONES[index % PALETA_PRESTACIONES.length]
  );
}
