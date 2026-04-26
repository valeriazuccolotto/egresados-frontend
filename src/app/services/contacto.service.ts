import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contacto } from '../models/contacto';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {

  private apiUrl = 'http://localhost:8189/egresados/contacto';

  constructor(private http: HttpClient) {}

  guardar(contacto: Contacto): Observable<Contacto> {
    return this.http.post<Contacto>(this.apiUrl, contacto);
  }

  actualizar(matricula: string, contacto: Contacto): Observable<Contacto> {
    return this.http.put<Contacto>(`${this.apiUrl}/${matricula}`, contacto);
  }

  obtenerPorMatricula(matricula: string): Observable<Contacto> {
    return this.http.get<Contacto>(`${this.apiUrl}/${matricula}`);
  }
}