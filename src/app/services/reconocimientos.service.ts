import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reconocimiento } from '../models/reconocimiento';

@Injectable({ providedIn: 'root' })
export class ReconocimientosService {

  private readonly url = '/egresados/reconocimientos';

  constructor(private http: HttpClient) {}

  getReconocimientos(): Observable<Reconocimiento[]> {
    return this.http.get<Reconocimiento[]>(this.url);
  }

  getPorMatricula(matricula: string): Observable<Reconocimiento[]> {
    return this.http.get<Reconocimiento[]>(`${this.url}/${matricula}`);
  }

  guardar(data: Reconocimiento): Observable<Reconocimiento> {
    return this.http.post<Reconocimiento>(this.url, data);
  }

  actualizar(id: number, data: Reconocimiento): Observable<Reconocimiento> {
    return this.http.put<Reconocimiento>(`${this.url}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>('/egresados');
  }
}
