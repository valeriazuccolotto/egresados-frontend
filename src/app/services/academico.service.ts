import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Academico } from '../models/academico';
import { Carrera } from '../models/carrera';

@Injectable({
  providedIn: 'root'
})
export class AcademicoService {

  private baseUrl = '';

  constructor(private http: HttpClient) {}

  getAcademicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados/academico`).pipe(
      catchError(() => this.http.get<any[]>(`${this.baseUrl}/egresado/academico`))
    );
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados`);
  }

  obtenerPorMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/egresados/academico/${matricula}`).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/egresado/academico/${matricula}`))
    );
  }

  guardar(academico: Academico): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/egresados/academico`, academico).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/egresado/academico`, academico))
    );
  }

  actualizar(matricula: string, academico: Academico): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/egresados/academico/${matricula}`, academico).pipe(
      catchError(() => this.http.put<any>(`${this.baseUrl}/egresado/academico/${matricula}`, academico))
    );
  }

  obtenerCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.baseUrl}/egresados/academico/carreras`).pipe(
      catchError(() => this.http.get<Carrera[]>(`${this.baseUrl}/egresado/academico/carreras`))
    );
  }
}