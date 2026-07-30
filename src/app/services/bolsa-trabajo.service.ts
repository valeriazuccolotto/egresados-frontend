import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BolsaTrabajo, BolsaTrabajoRequest } from '../models/bolsa-trabajo';

@Injectable({
  providedIn: 'root'
})
export class BolsaTrabajoService {

  private apiUrl = '/bolsa-trabajo';

  constructor(private http: HttpClient) {}

  getVacantes(): Observable<BolsaTrabajo[]> {
    return this.http.get<BolsaTrabajo[]>(this.apiUrl);
  }

  getVacantesActivas(): Observable<BolsaTrabajo[]> {
    return this.http.get<BolsaTrabajo[]>(`${this.apiUrl}/activas`);
  }

  getVacante(id: number): Observable<BolsaTrabajo> {
    return this.http.get<BolsaTrabajo>(`${this.apiUrl}/${id}`);
  }

  crearVacante(vacante: BolsaTrabajoRequest): Observable<BolsaTrabajo> {
    return this.http.post<BolsaTrabajo>(this.apiUrl, vacante);
  }

  actualizarVacante(id: number, vacante: BolsaTrabajoRequest): Observable<BolsaTrabajo> {
    return this.http.put<BolsaTrabajo>(`${this.apiUrl}/${id}`, vacante);
  }

  desactivarVacante(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reactivarVacante(id: number): Observable<BolsaTrabajo> {
    return this.http.post<BolsaTrabajo>(`${this.apiUrl}/${id}/reactivar`, {});
  }
}
