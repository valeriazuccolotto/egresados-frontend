import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Academico } from '../models/academico';
import { Carrera } from '../models/carrera';

@Injectable({
  providedIn: 'root'
})
export class AcademicoService {

  private readonly url = '/egresados/academico';

  constructor(private http: HttpClient) {}

  getAcademicos(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>('/egresados');
  }

  obtenerPorMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${matricula}`);
  }

  guardar(academico: Academico): Observable<any> {
    return this.http.post<any>(this.url, academico);
  }

  actualizar(matricula: string, academico: Academico): Observable<any> {
    return this.http.put<any>(`${this.url}/${matricula}`, academico);
  }

  obtenerCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.url}/carreras`);
  }
}
