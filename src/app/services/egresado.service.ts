import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Egresado } from '../models/egresado';

@Injectable({
  providedIn: 'root'
})
export class EgresadoService {

  private url = '/egresados';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Egresado[]> {
    return this.http.get<Egresado[]>(this.url);
  }

  getCarreras(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/carreras`);
  }

  getGeneraciones(): Observable<number[]> {
    return this.http.get<number[]>(`${this.url}/generaciones`);
  }

  getByMatricula(matricula: string): Observable<Egresado> {
    return this.http.get<Egresado>(`${this.url}/${matricula}`);
  }

  guardar(egresado: Egresado): Observable<Egresado> {
    return this.http.post<Egresado>(this.url, egresado);
  }

  getVistaUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/vista-usuarios`);
  }

  getPerfilCompleto(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.url}/perfil/${matricula}`);
  }

  filtrarEgresados(
    campus: string,
    carrera: string,
    generacion: string
  ): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/filtrar`, {
      params: { campus, carrera, generacion }
    });
  }

  getLaboralPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/laboral/${matricula}`);
  }

  getPosgradoPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/posgrado/${matricula}`);
  }

  getReconocimientosPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/reconocimientos/${matricula}`);
  }

  getCertificacionesPorMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/certificaciones/${matricula}`);
  }

  getContactoPorMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.url}/contacto/${matricula}`);
  }

  getAcademicoPorMatricula(matricula: string): Observable<any> {
    return this.http.get<any>(`${this.url}/academico/${matricula}`);
  }
}
