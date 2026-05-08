import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Egresado } from '../../models/egresado';

@Injectable({
  providedIn: 'root'
})
export class EgresadoService {

  // 👇 Usa el puerto correcto según tu backend (8181 o 8080)
  private url = 'http://localhost:8181/egresados'; 

  constructor(private http: HttpClient) {}

  // 🔹 Obtener todos los egresados
  getAll(): Observable<Egresado[]> {
    return this.http.get<Egresado[]>(this.url);
  }

  // 🔹 Obtener todas las carreras
  getCarreras(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/carreras`);
  }

  // 🔹 Obtener todas las generaciones
  getGeneraciones(): Observable<number[]> {
    return this.http.get<number[]>(`${this.url}/generaciones`);
  }

  // 🔹 Buscar egresado por matrícula
  getByMatricula(matricula: string): Observable<Egresado> {
    return this.http.get<Egresado>(`${this.url}/${matricula}`);
  }

  // 🔹 Vista usuarios (lista con carrera, generación, etc.)
  getVistaUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/vista-usuarios`);
  }
}
