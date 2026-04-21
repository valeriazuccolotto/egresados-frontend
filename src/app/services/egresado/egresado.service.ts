import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Egresado } from '../../models/egresado';

@Injectable({
  providedIn: 'root'
})
export class EgresadoService {

  private url="http://localhost:8080/egresados";

  constructor(private http:HttpClient) {}

  getAll():Observable<Egresado[]>{
    return this.http.get<Egresado[]>(this.url);
  }

}