import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LaboralService {

  private baseUrl = '';

  constructor(private http: HttpClient) {}

  getLaborales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados/laboral`).pipe(
      catchError(() => this.http.get<any[]>(`${this.baseUrl}/egresado/laboral`))
    );
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados`);
  }

  getPrestaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresado/prestaciones`).pipe(
      catchError(() => this.http.get<any[]>(`${this.baseUrl}/egresados/prestaciones`))
    );
  }

  guardar(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/egresados/laboral`, data).pipe(
      catchError(() => this.http.post<any>(`${this.baseUrl}/egresado/laboral`, data))
    );
  }
}