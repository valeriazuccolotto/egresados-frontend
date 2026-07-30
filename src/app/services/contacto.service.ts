import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contacto } from '../models/contacto';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {

  private readonly url = '/egresados/contacto';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(this.url);
  }

  obtenerPorMatricula(matricula: string): Observable<Contacto> {
    return this.http.get<Contacto>(`${this.url}/${matricula}`);
  }

  guardar(contacto: Contacto): Observable<Contacto> {
    return this.http.post<Contacto>(this.url, contacto);
  }

  actualizar(matricula: string, contacto: Contacto): Observable<Contacto> {
    return this.http.put<Contacto>(`${this.url}/${matricula}`, contacto);
  }

  eliminar(matricula: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${matricula}`);
  }
}
