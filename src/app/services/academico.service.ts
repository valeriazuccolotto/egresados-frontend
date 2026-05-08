import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Academico } from '../models/academico';
import { Carrera } from '../models/carrera';

@Injectable({
  providedIn: 'root'
})
export class AcademicoService {

  // API principal
  private apiUrl = 'http://localhost:8189/egresados/academico';

  // Base URL general
  private baseUrl = 'http://localhost:8189';

  constructor(private http: HttpClient) {}

  // =========================
  // EGRESADOS
  // =========================

  obtenerPorMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${matricula}`);
  }

  guardar(academico: Academico): Observable<any> {
    return this.http.post<any>(this.apiUrl, academico);
  }

  actualizar(matricula: string, academico: Academico): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${matricula}`, academico);
  }

  obtenerCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.apiUrl}/carreras`);
  }

  // =========================
  // REPORTES / ADMIN
  // =========================

  getAcademicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados/academico`);
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados`);
  }
}