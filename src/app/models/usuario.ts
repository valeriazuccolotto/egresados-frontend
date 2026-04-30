export interface Usuario {
  matricula: string;
  password: string;
  rol?: string;       // 👈 OPCIONAL
  activo?: boolean;   // 👈 OPCIONAL (recomendado)
}