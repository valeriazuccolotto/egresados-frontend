import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LaboralService {

  private baseUrl = 'http://localhost:8181';

  constructor(private http: HttpClient) {}

  getLaborales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresado/laboral`);
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados`);
  }

  getPrestaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresado/prestaciones`);
  }

  guardar(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/egresado/laboral`, data);
  }
}