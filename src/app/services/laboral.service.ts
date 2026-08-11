import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LaboralService {

  private readonly laboralUrl = '/egresados/laboral';
  private readonly prestacionesUrl = '/egresados/prestaciones';
  private readonly municipiosUrl = '/egresados/catalogos/municipios-oaxaca';

  constructor(private http: HttpClient) {}

  getLaborales(): Observable<any[]> {
    return this.http.get<any[]>(this.laboralUrl);
  }

  getPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.laboralUrl}/${matricula}`);
  }

  guardar(data: any): Observable<any> {
    return this.http.post<any>(this.laboralUrl, data);
  }

  actualizar(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.laboralUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.laboralUrl}/${id}`);
  }

  getPrestaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.prestacionesUrl);
  }

  crearPrestacion(nombre: string): Observable<any> {
    return this.http.post<any>(this.prestacionesUrl, { nombre });
  }

  getMunicipiosOaxaca(): Observable<string[]> {
    return this.http.get<string[]>(this.municipiosUrl).pipe(
      catchError(() => this.http.get<string[]>(`${this.laboralUrl}/catalogo/municipios-oaxaca`)),
      catchError(() => this.http.get<string[]>('/assets/catalogos/municipios-oaxaca.pdf'))
    );
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>('/egresados');
  }
}
