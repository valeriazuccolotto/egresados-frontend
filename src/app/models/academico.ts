export interface Academico {
  matricula: string;
  claveCarrera: string;
  promedio: number | null;
  anioEgreso: number | null;
  titulado: string;
  fechaTitulacion: string | null;
  tipoTitulacion: string | null;
  cedulaProfesional: string;

  nombreTesis: string;
  director: string;
  codirector: string;

  fechaExamenCeneval: string | null;
  puntajeCeneval: number | null;

  tituloMemoria: string;
  asesor: string;
  fechaExamenMemoria: string | null;
}