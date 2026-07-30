import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EstadisticasPostulacion,
  PostulacionBolsaTrabajo,
  PostulacionVista
} from '../models/postulacion-bolsa-trabajo';

@Injectable({
  providedIn: 'root'
})
export class PostulacionBolsaTrabajoService {

  private apiUrl = '/bolsa-trabajo';

  constructor(private http: HttpClient) {}

  // ——— Egresado ———

  aplicar(idBolsaTrabajo: number, matricula: string): Observable<PostulacionBolsaTrabajo> {
    return this.http.post<PostulacionBolsaTrabajo>(
      `${this.apiUrl}/${idBolsaTrabajo}/postulaciones/${matricula}/aplicar`,
      {}
    );
  }

  marcarContratado(idBolsaTrabajo: number, matricula: string): Observable<PostulacionBolsaTrabajo> {
    return this.http.post<PostulacionBolsaTrabajo>(
      `${this.apiUrl}/${idBolsaTrabajo}/postulaciones/${matricula}/contratado`,
      {}
    );
  }

  obtenerPostulacion(idBolsaTrabajo: number, matricula: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${idBolsaTrabajo}/postulaciones/${matricula}`
    );
  }

  obtenerPorMatricula(matricula: string): Observable<PostulacionBolsaTrabajo[]> {
    return this.http.get<PostulacionBolsaTrabajo[]>(
      `${this.apiUrl}/postulaciones/egresados/${matricula}`
    );
  }

  // ——— Admin ———

  listarPorVacante(idBolsaTrabajo: number): Observable<PostulacionVista[]> {
    return this.http.get<PostulacionVista[]>(
      `${this.apiUrl}/${idBolsaTrabajo}/postulaciones`
    );
  }

  obtenerEstadisticas(idBolsaTrabajo: number): Observable<EstadisticasPostulacion> {
    return this.http.get<EstadisticasPostulacion>(
      `${this.apiUrl}/${idBolsaTrabajo}/postulaciones/estadisticas`
    );
  }
}