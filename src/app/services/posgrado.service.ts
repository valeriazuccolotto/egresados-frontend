import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PosgradoService {

  private readonly posgradoUrl = '/egresados/posgrado';
  private readonly tipoBecaUrl = '/tipo-beca';

  constructor(private http: HttpClient) {}

  getPosgrados(): Observable<any[]> {
    return this.http.get<any[]>(this.posgradoUrl);
  }

  getPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.posgradoUrl}/${matricula}`);
  }

  guardar(data: any): Observable<any> {
    return this.http.post<any>(this.posgradoUrl, data);
  }

  actualizar(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.posgradoUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.posgradoUrl}/${id}`);
  }

  getTiposBeca(): Observable<any[]> {
    return this.http.get<any[]>(this.tipoBecaUrl);
  }

  crearTipoBeca(nombre: string): Observable<any> {
    return this.http.post<any>(this.tipoBecaUrl, { nombre });
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>('/egresados');
  }
}
