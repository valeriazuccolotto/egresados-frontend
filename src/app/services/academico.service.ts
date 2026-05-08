import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Academico } from '../models/academico';
import { Carrera } from '../models/carrera';

@Injectable({
  providedIn: 'root'
})
export class AcademicoService {

  private baseUrl = 'http://localhost:8181';

  constructor(private http: HttpClient) {}

  getAcademicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados/academico`);
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados`);
  }

  obtenerPorMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/egresados/academico/${matricula}`);
  }

  guardar(academico: Academico): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/egresados/academico`, academico);
  }

  actualizar(matricula: string, academico: Academico): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/egresados/academico/${matricula}`, academico);
  }

  obtenerCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.baseUrl}/egresados/academico/carreras`);
  }
}