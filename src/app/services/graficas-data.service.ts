import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GraficasDataService {
  private base = 'http://localhost:8181';

  constructor(private http: HttpClient) {}

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresados`);
  }
  getAcademicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresados/academico`);
  }
  getLaborales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresado/laboral`);
  }
  getPosgrados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresado/posgrado`);
  }
  getReconocimientos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresado/reconocimientos`);
  }
  getCertificaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresado/certificaciones`);
  }

  filtrarPorCampus(datos: any[], egresados: any[], campus: string): any[] {
    if (campus === 'Todos') return datos;
    const mats = new Set(egresados.filter(e => e.campus === campus).map(e => e.matricula));
    return datos.filter(d => mats.has(d.matricula));
  }
}