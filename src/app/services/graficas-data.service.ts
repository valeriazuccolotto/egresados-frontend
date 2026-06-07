import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GraficasDataService {
  private readonly base = '';

  constructor(private http: HttpClient) {}

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresados`);
  }

  getAcademicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresados/academico`).pipe(
      catchError(() => this.http.get<any[]>(`${this.base}/egresado/academico`))
    );
  }

  getLaborales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresado/laboral`).pipe(
      catchError(() => this.http.get<any[]>(`${this.base}/egresados/laboral`))
    );
  }

  getPosgrados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresado/posgrado`).pipe(
      catchError(() => this.http.get<any[]>(`${this.base}/egresados/posgrado`))
    );
  }

  getReconocimientos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresado/reconocimientos`).pipe(
      catchError(() => this.http.get<any[]>(`${this.base}/egresados/reconocimientos`))
    );
  }

  getCertificaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/egresado/certificaciones`).pipe(
      catchError(() => this.http.get<any[]>(`${this.base}/egresados/certificaciones`))
    );
  }

  filtrarPorCampus(datos: any[], egresados: any[], campus: string): any[] {
    if (campus === 'Todos') {
      return datos;
    }
    const mats = new Set(egresados.filter(e => e.campus === campus).map(e => e.matricula));
    return datos.filter(d => mats.has(d.matricula));
  }
}
