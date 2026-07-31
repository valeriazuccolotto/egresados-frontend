export type TipoSolicitud = 'INFORMACION' | 'ARCHIVOS';

export interface CarreraSolicitud {
  claveCarrera: string;
  nombreCarrera?: string;
}

export interface Solicitud {
  idSolicitud?: number;
  tipo: TipoSolicitud;
  titulo: string;
  descripcion: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  activa?: boolean;
  creadoPor?: string;
  fechaCreacion?: string;
  carreras?: CarreraSolicitud[];
  yaRespondio?: boolean;
  puedeResponder?: boolean;
  estadoEgresado?: 'PENDIENTE' | 'VENCIDA' | 'RESPONDIDA';
}

export interface CrearSolicitudDto {
  titulo: string;
  descripcion: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  carreras?: string[];
}

export interface EnviarRespuestaInformacionDto {
  contenido: string;
  comentario?: string;
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
