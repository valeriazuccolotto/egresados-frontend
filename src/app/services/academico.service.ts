import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Academico } from '../models/academico';

@Injectable({
  providedIn: 'root'
})
export class AcademicoService {

  private apiUrl = 'http://localhost:8089/egresados/academico';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Academico[]> {
    return this.http.get<Academico[]>(this.apiUrl);
  }

  obtenerPorMatricula(matricula: string): Observable<Academico> {
    return this.http.get<Academico>(`${this.apiUrl}/${matricula}`);
  }

  crear(academico: Academico): Observable<Academico> {
    return this.http.post<Academico>(this.apiUrl, academico);
  }

  actualizar(matricula: string, academico: Academico): Observable<Academico> {
    return this.http.put<Academico>(`${this.apiUrl}/${matricula}`, academico);
  }

  eliminar(matricula: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${matricula}`);
  }
}