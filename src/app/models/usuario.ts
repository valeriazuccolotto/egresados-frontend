export interface Usuario {
  matricula: string;
  password: string;
  rol?: string;
  activo?: boolean;
  debeCambiarPassword?: boolean;
}