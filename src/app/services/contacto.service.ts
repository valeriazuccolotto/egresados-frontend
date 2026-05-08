import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contacto } from '../models/contacto';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {

  private apiUrl = '/egresados/contacto';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(this.apiUrl);
  }

  obtenerPorMatricula(matricula: string): Observable<Contacto> {
    return this.http.get<Contacto>(`${this.apiUrl}/${matricula}`);
  }

  guardar(contacto: Contacto): Observable<Contacto> {
    return this.http.post<Contacto>(this.apiUrl, contacto);
  }

  actualizar(matricula: string, contacto: Contacto) {
  return this.http.put<Contacto>(`${this.apiUrl}/${matricula}`, contacto);
}

  eliminar(matricula: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${matricula}`);
  }
}