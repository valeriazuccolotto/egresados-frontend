import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ValidacionCampo {
  matricula: string;
  seccion: string;
  campo: string;
  referenciaId?: string;
  validado: boolean;
  validadoPor?: string;
  fechaValidacion?: string;
  valorValidado?: string;
}

export interface ValidarCampoRequest {
  seccion: string;
  campo: string;
  referenciaId?: string;
  validadoPor?: string;
  valorValidado?: string;
}

@Injectable({ providedIn: 'root' })
export class ValidacionCampoService {

  private readonly baseUrl = '/admin/validaciones';

  constructor(private http: HttpClient) {}

  listar(matricula: string): Observable<ValidacionCampo[]> {
    return this.http.get<ValidacionCampo[]>(`${this.baseUrl}/${encodeURIComponent(matricula)}`);
  }

  validar(matricula: string, request: ValidarCampoRequest): Observable<ValidacionCampo> {
    return this.http.post<ValidacionCampo>(`${this.baseUrl}/${encodeURIComponent(matricula)}`, request);
  }

  revocar(matricula: string, request: ValidarCampoRequest): Observable<ValidacionCampo> {
    return this.http.request<ValidacionCampo>(
      'DELETE',
      `${this.baseUrl}/${encodeURIComponent(matricula)}`,
      { body: request }
    );
  }
}
