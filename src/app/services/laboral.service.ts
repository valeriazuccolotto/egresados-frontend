import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LaboralService {

  private api = 'http://localhost:8189/egresado/laboral';

  constructor(private http: HttpClient) {}

  guardar(data: any) {
    return this.http.post(this.api, data);
  }
}