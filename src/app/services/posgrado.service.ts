import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PosgradoService {

  private baseUrl = '';

  constructor(private http: HttpClient) {}

  getPosgrados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados/posgrado`).pipe(
      catchError(() => this.http.get<any[]>(`${this.baseUrl}/egresado/posgrado`))
    );
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados`);
  }
}