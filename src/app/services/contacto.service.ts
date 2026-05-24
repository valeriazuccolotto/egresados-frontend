import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Contacto } from '../models/contacto';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {

  private apiUrlPlural = '/egresados/contacto';
  private apiUrlSingular = '/egresado/contacto';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(this.apiUrlPlural).pipe(
      catchError(() => this.http.get<Contacto[]>(this.apiUrlSingular))
    );
  }

  obtenerPorMatricula(matricula: string): Observable<Contacto> {
    return this.http.get<Contacto>(`${this.apiUrlPlural}/${matricula}`).pipe(
      catchError(() => this.http.get<Contacto>(`${this.apiUrlSingular}/${matricula}`))
    );
  }

  guardar(contacto: Contacto): Observable<Contacto> {
    return this.http.post<Contacto>(this.apiUrlPlural, contacto).pipe(
      catchError(() => this.http.post<Contacto>(this.apiUrlSingular, contacto))
    );
  }

  actualizar(matricula: string, contacto: Contacto) {
    return this.http.put<Contacto>(`${this.apiUrlPlural}/${matricula}`, contacto).pipe(
      catchError(() => this.http.put<Contacto>(`${this.apiUrlSingular}/${matricula}`, contacto))
    );
  }

  eliminar(matricula: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlPlural}/${matricula}`).pipe(
      catchError(() => this.http.delete<void>(`${this.apiUrlSingular}/${matricula}`))
    );
  }
}