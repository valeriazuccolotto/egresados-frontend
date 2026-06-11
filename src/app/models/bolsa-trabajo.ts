import { Carrera } from './carrera';

export interface BolsaTrabajo {
  idBolsaTrabajo: number;
  matricula: string;
  nombreEmpresa: string;
  puesto: string;
  descripcion: string;
  salarioOfertado: number | null;
  modalidad: string;
  correoContacto: string;
  telefonoContacto: string;
  activo: boolean;
  fechaPublicacion: string;
  fechaActualizacion: string;
  carreras: Carrera[];
}

export interface BolsaTrabajoRequest {
  matricula: string;
  nombreEmpresa: string;
  puesto: string;
  descripcion: string;
  salarioOfertado: number | null;
  modalidad: string;
  correoContacto: string;
  telefonoContacto: string;
  carreras: Array<{ claveCarrera: string }>;
}
