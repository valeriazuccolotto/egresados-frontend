export interface Academico {
  matricula: string;

  claveCarrera?: string;
  promedio?: number | null;
  anioEgreso?: number | null;

  titulado?: string;
  fechaTitulacion?: string | null;
  tipoTitulacion?: string | null;
  cedulaProfesional?: string;

  nombreTesis?: string | null;
  director?: string | null;
  codirector?: string | null;

  fechaExamen?: string | null;
  puntajeCeneval?: number | null;

  tituloMemoria?: string | null;
  asesor?: string | null;
}