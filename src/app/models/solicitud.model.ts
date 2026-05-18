export type TipoSolicitud = 'INFORMACION' | 'ARCHIVOS';

export interface Solicitud {
  idSolicitud?: number;
  tipo: TipoSolicitud;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  activa?: boolean;
  creadoPor?: string;
  fechaCreacion?: string;
  yaRespondio?: boolean;
  puedeResponder?: boolean;
}

export interface CrearSolicitudDto {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface RespuestaArchivo {
  idArchivo?: number;
  nombreOriginal?: string;
  rutaAlmacenamiento?: string;
  tamanoBytes?: number;
}

export interface RespuestaSolicitud {
  idRespuesta?: number;
  idSolicitud?: number;
  matricula?: string;
  contenido?: string;
  comentario?: string;
  nombreEgresado?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  archivos?: RespuestaArchivo[];
  fechaRespuesta?: string;
}
