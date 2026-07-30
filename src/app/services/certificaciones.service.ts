import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificacion } from '../models/certificacion';

@Injectable({ providedIn: 'root' })
export class CertificacionesService {

  private readonly url = '/egresados/certificaciones';

  constructor(private http: HttpClient) {}

  getPorMatricula(matricula: string): Observable<Certificacion[]> {
    return this.http.get<Certificacion[]>(`${this.url}/${matricula}`);
  }

  getTodas(): Observable<Certificacion[]> {
    return this.http.get<Certificacion[]>(this.url);
  }

  guardar(data: Certificacion): Observable<Certificacion> {
    return this.http.post<Certificacion>(this.url, data);
  }

  actualizar(id: number, data: Certificacion): Observable<Certificacion> {
    return this.http.put<Certificacion>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
