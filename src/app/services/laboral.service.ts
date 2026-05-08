import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LaboralService {

  // URL principal
  private api = 'http://localhost:8189/egresado/laboral';

  // URL base general
  private baseUrl = 'http://localhost:8189';

  constructor(private http: HttpClient) {}

  // =========================
  // EGRESADOS
  // =========================

  guardar(data: any) {
    return this.http.post(this.api, data);
  }

  // =========================
  // REPORTES / ADMIN
  // =========================

  getLaborales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresado/laboral`);
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados`);
  }

  getPrestaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresado/prestaciones`);
  }
}