export type EstadoSolicitudRegistro = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

export interface SolicitudRegistro {
  idSolicitud?: number;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  matricula: string;
  curp: string;
  correo: string;
  estado?: EstadoSolicitudRegistro;
  motivoRechazo?: string;
  fechaSolicitud?: string;
  fechaResolucion?: string;
  resueltoPor?: string;
}

export interface CrearSolicitudRegistro {
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  matricula: string;
  curp: string;
  correo: string;
}
