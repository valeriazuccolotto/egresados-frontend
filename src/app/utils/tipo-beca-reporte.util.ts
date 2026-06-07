function normalizarNombre(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function tieneBecaActiva(item: any): boolean {
  return item?.tieneBeca === true || item?.tieneBeca === 'true' || item?.tieneBeca === 1;
}

export function normalizarTiposBecaLista(item: any): Array<{ nombre?: string }> {
  if (!item) {
    return [];
  }

  if (Array.isArray(item.tiposBeca)) {
    return item.tiposBeca;
  }

  if (item.tiposBeca && typeof item.tiposBeca === 'object' && item.tiposBeca.nombre) {
    return [item.tiposBeca];
  }

  if (item.tipoBeca) {
    return Array.isArray(item.tipoBeca) ? item.tipoBeca : [item.tipoBeca];
  }

  return [];
}

export function datosGraficaTipoBeca(
  catalogo: Array<{ nombre?: string }>,
  posgrados: any[]
): { labels: string[]; values: number[] } {
  const conBeca = posgrados.filter(tieneBecaActiva);
  const etiquetasConocidas = new Set<string>();
  const labels: string[] = [];

  for (const item of catalogo) {
    const nombre = String(item?.nombre ?? '').trim();
    if (!nombre) {
      continue;
    }
    const clave = normalizarNombre(nombre);
    if (!etiquetasConocidas.has(clave)) {
      etiquetasConocidas.add(clave);
      labels.push(nombre);
    }
  }

  const extras: string[] = [];
  for (const posgrado of conBeca) {
    for (const beca of normalizarTiposBecaLista(posgrado)) {
      const nombre = String(beca?.nombre ?? '').trim();
      if (!nombre) {
        continue;
      }
      const clave = normalizarNombre(nombre);
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
    value: conBeca.filter(posgrado =>
      normalizarTiposBecaLista(posgrado).some(
        beca => normalizarNombre(beca?.nombre) === normalizarNombre(label)
      )
    ).length
  }));

  pares.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'es'));

  return {
    labels: pares.map(par => par.label),
    values: pares.map(par => par.value)
  };
}
