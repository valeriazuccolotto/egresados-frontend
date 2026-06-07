/** Conserva un solo registro laboral por matrícula: el más reciente. */
export function laboralesActualesPorMatricula(laborales: any[]): any[] {
  const porMatricula = new Map<string, any>();

  for (const lab of laborales) {
    const matricula = lab?.matricula;
    if (!matricula) {
      continue;
    }
    const actual = porMatricula.get(matricula);
    if (!actual || esLaboralMasReciente(lab, actual)) {
      porMatricula.set(matricula, lab);
    }
  }

  return Array.from(porMatricula.values());
}

function esLaboralMasReciente(candidato: any, actual: any): boolean {
  const fechaC = timestampRegistro(candidato);
  const fechaA = timestampRegistro(actual);

  if (fechaC !== fechaA) {
    return fechaC > fechaA;
  }

  const idC = idLaboralNumerico(candidato);
  const idA = idLaboralNumerico(actual);
  return idC > idA;
}

function timestampRegistro(lab: any): number {
  const raw = lab?.fechaRegistro ?? lab?.fecha_registro;
  if (!raw) {
    return 0;
  }
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function idLaboralNumerico(lab: any): number {
  return Number(lab?.idLaboral ?? lab?.id_laboral ?? 0);
}
