import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EgresadoVista } from '../models/egresado-vista';

@Injectable({ providedIn: 'root' })
export class EgresadoVistaService {
  private url = 'http://localhost:8189/egresados/vista-usuarios';
  constructor(private http: HttpClient) {}
  getAll(): Observable<EgresadoVista[]> {
    return this.http.get<EgresadoVista[]>(this.url);
  }
}