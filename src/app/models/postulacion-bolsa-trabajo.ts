export interface PostulacionBolsaTrabajo {
  idPostulacion: number;
  idBolsaTrabajo: number;
  matricula: string;
  estado: 'Aplicado' | 'Contratado';
  fechaAplicacion: string;
  fechaContratacion: string | null;
}

export interface PostulacionVista {
  idPostulacion: number;
  idBolsaTrabajo: number;
  matricula: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  estado: 'Aplicado' | 'Contratado';
  fechaAplicacion: string;
  fechaContratacion: string | null;
}

export interface EstadisticasPostulacion {
  totalPostulaciones: number;
  totalAplicados: number;
  totalContratados: number;
}