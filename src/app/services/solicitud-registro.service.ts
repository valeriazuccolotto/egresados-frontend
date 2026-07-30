import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearSolicitudRegistro, SolicitudRegistro } from '../models/solicitud-registro';

@Injectable({ providedIn: 'root' })
export class SolicitudRegistroService {

  private readonly publicUrl = '/usuarios/registro';
  private readonly adminUrl = '/admin/solicitudes-registro';

  constructor(private http: HttpClient) {}

  registrar(dto: CrearSolicitudRegistro): Observable<SolicitudRegistro> {
    return this.http.post<SolicitudRegistro>(this.publicUrl, dto);
  }

  listar(estado?: string): Observable<SolicitudRegistro[]> {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    return this.http.get<SolicitudRegistro[]>(`${this.adminUrl}${query}`);
  }

  aceptar(id: number, resueltoPor?: string): Observable<SolicitudRegistro> {
    return this.http.post<SolicitudRegistro>(`${this.adminUrl}/${id}/aceptar`, { resueltoPor });
  }

  rechazar(id: number, motivo: string, resueltoPor?: string): Observable<SolicitudRegistro> {
    return this.http.post<SolicitudRegistro>(`${this.adminUrl}/${id}/rechazar`, { motivo, resueltoPor });
  }
}
