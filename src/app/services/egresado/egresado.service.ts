import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Egresado } from '../../models/egresado';

@Injectable({
  providedIn: 'root'
})
export class EgresadoService {

  // 👇 Usa el puerto correcto según tu backend
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

  // 🔹 Vista usuarios
  getVistaUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/vista-usuarios`);
  }

  // 🔹 Perfil completo con foto
  getPerfilCompleto(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.url}/perfil/${matricula}`);
  }

  // 🔹 Filtrar egresados
  filtrarEgresados(
    campus: string,
    carrera: string,
    generacion: string
  ): Observable<any[]> {

    return this.http.get<any[]>(

      `${this.url}/filtrar`,

      {
        params: {
          campus,
          carrera,
          generacion
        }
      }

    );

  }

  // 🔹 Módulos por matrícula (detalle)
  getLaboralPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8181/egresado/laboral/${matricula}`);
  }

  getPosgradoPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8181/egresado/posgrado/${matricula}`);
  }

  getReconocimientosPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8181/egresado/reconocimientos/${matricula}`);
  }

  getCertificacionesPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8181/egresado/certificaciones/${matricula}`);
  }

  getContactoPorMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.url}/contacto/${matricula}`);
  }

  getAcademicoPorMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.url}/academico/${matricula}`);
  }

}