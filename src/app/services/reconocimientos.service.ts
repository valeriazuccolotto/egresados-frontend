import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReconocimientosService {

  private baseUrl = '';

  constructor(private http: HttpClient) {}

  getReconocimientos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresado/reconocimientos`).pipe(
      catchError(() => this.http.get<any[]>(`${this.baseUrl}/egresados/reconocimientos`))
    );
  }

  getEgresados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/egresados`);
  }
}