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

  crearVacante(vacante: BolsaTrabajoRequest): Observable<BolsaTrabajo> {
    return this.http.post<BolsaTrabajo>(this.apiUrl, vacante);
  }
}
