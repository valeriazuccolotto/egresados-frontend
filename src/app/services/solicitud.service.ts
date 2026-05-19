import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import {
  CrearSolicitudDto,
  EnviarRespuestaInformacionDto,
  RespuestaSolicitud,
  Solicitud,
  TipoSolicitud
} from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {

  constructor(private http: HttpClient) {}

  // ——— Admin ———

  listarAdmin(tipo?: TipoSolicitud): Observable<Solicitud[]> {
    const query = tipo ? `?tipo=${tipo}` : '';
    return this.http.get<any[]>(`/admin/solicitar-info${query}`).pipe(
      catchError(() => this.http.get<any[]>(`/egresados/admin/solicitar-info${query}`)),
      map(list => (list || []).map(s => this.normalizarSolicitud(s)))
    );
  }

  crearInformacion(dto: CrearSolicitudDto): Observable<Solicitud> {
    const body = { ...dto, tipo: 'INFORMACION' };
    return this.http.post<any>('/admin/solicitar-info/informacion', body).pipe(
      catchError(() => this.http.post<any>('/admin/solicitar-info', body)),
      map(s => this.normalizarSolicitud(s))
    );
  }

  crearArchivos(dto: CrearSolicitudDto): Observable<Solicitud> {
    const body = { ...dto, tipo: 'ARCHIVOS' };
    return this.http.post<any>('/admin/solicitar-info/archivos', body).pipe(
      catchError(() => this.http.post<any>('/admin/solicitar-info', body)),
      map(s => this.normalizarSolicitud(s))
    );
  }

  cerrarSolicitud(idSolicitud: number): Observable<void> {
    return this.http.patch<void>(`/admin/solicitar-info/${idSolicitud}/cerrar`, {}).pipe(
      catchError(() => this.http.put<void>(`/admin/solicitar-info/${idSolicitud}/cerrar`, {}))
    );
  }

  eliminarSolicitud(idSolicitud: number): Observable<void> {
    return this.http.post<void>(`/admin/solicitar-info/${idSolicitud}/eliminar`, {}).pipe(
      catchError(() => this.http.delete<void>(`/admin/solicitar-info/${idSolicitud}`))
    );
  }

  listarRespuestas(idSolicitud: number): Observable<RespuestaSolicitud[]> {
    return this.http.get<any[]>(`/admin/solicitar-info/${idSolicitud}/respuestas`).pipe(
      catchError(() => this.http.get<any[]>(`/egresados/admin/solicitar-info/${idSolicitud}/respuestas`)),
      map(list => (list || []).map(r => this.normalizarRespuesta(r)))
    );
  }

  urlDescargaArchivo(idArchivo: number): string {
    return `/admin/solicitar-info/archivos/${idArchivo}/descargar`;
  }

  // ——— Egresado ———

  listarParaEgresado(matricula: string): Observable<Solicitud[]> {
    const m = encodeURIComponent(matricula);
    return this.http.get<any[]>(`/egresados/solicitar-info/${m}`).pipe(
      catchError(() => this.http.get<any[]>(`/egresado/solicitar-info/${m}`)),
      map(list => (list || []).map(s => this.normalizarSolicitud(s)))
    );
  }

  obtenerParaEgresado(matricula: string, idSolicitud: number): Observable<Solicitud> {
    const m = encodeURIComponent(matricula);
    return this.http.get<any>(`/egresados/solicitar-info/${m}/${idSolicitud}`).pipe(
      catchError(() => this.http.get<any>(`/egresado/solicitar-info/${m}/${idSolicitud}`)),
      map(s => this.normalizarSolicitud(s))
    );
  }

  obtenerMiRespuesta(matricula: string, idSolicitud: number): Observable<RespuestaSolicitud> {
    const m = encodeURIComponent(matricula);
    return this.http.get<any>(`/egresados/solicitar-info/${m}/${idSolicitud}/mi-respuesta`).pipe(
      catchError(() => this.http.get<any>(`/egresado/solicitar-info/${m}/${idSolicitud}/mi-respuesta`)),
      map(r => this.normalizarRespuesta(r))
    );
  }

  responderInformacion(
    matricula: string,
    idSolicitud: number,
    dto: EnviarRespuestaInformacionDto
  ): Observable<RespuestaSolicitud> {
    const m = encodeURIComponent(matricula);
    return this.http.post<any>(`/egresados/solicitar-info/${m}/${idSolicitud}/respuesta`, dto).pipe(
      catchError(() => this.http.post<any>(`/egresado/solicitar-info/${m}/${idSolicitud}/respuesta`, dto)),
      map(r => this.normalizarRespuesta(r))
    );
  }

  responderArchivos(
    matricula: string,
    idSolicitud: number,
    archivos: File[],
    comentario?: string
  ): Observable<RespuestaSolicitud> {
    const formData = new FormData();
    archivos.forEach(f => formData.append('files', f));
    if (comentario?.trim()) {
      formData.append('comentario', comentario.trim());
    }
    const m = encodeURIComponent(matricula);
    return this.http.post<any>(
      `/egresados/solicitar-info/${m}/${idSolicitud}/respuesta-archivos`,
      formData
    ).pipe(
      catchError(() => this.http.post<any>(
        `/egresado/solicitar-info/${m}/${idSolicitud}/respuesta-archivos`,
        formData
      )),
      map(r => this.normalizarRespuesta(r))
    );
  }

  private normalizarSolicitud(raw: any): Solicitud {
    return {
      idSolicitud: raw?.idSolicitud ?? raw?.id_solicitud,
      tipo: (raw?.tipo || 'INFORMACION').toUpperCase() as TipoSolicitud,
      titulo: raw?.titulo ?? '',
      descripcion: raw?.descripcion ?? '',
      fechaInicio: this.normalizarFecha(raw?.fechaInicio ?? raw?.fecha_inicio),
      fechaFin: this.normalizarFecha(raw?.fechaFin ?? raw?.fecha_fin),
      activa: raw?.activa ?? true,
      creadoPor: raw?.creadoPor ?? raw?.creado_por,
      fechaCreacion: raw?.fechaCreacion ?? raw?.fecha_creacion,
      yaRespondio: raw?.yaRespondio ?? raw?.ya_respondio ?? false,
      puedeResponder: raw?.puedeResponder ?? raw?.puede_responder
    };
  }

  private normalizarRespuesta(raw: any): RespuestaSolicitud {
    const archivos = raw?.archivos ?? raw?.listaArchivos ?? [];
    return {
      idRespuesta: raw?.idRespuesta ?? raw?.id_respuesta,
      idSolicitud: raw?.idSolicitud ?? raw?.id_solicitud,
      matricula: raw?.matricula,
      contenido: raw?.contenido,
      comentario: raw?.comentario,
      nombreEgresado: raw?.nombreEgresado ?? raw?.nombre,
      apellidoPaterno: raw?.apellidoPaterno ?? raw?.apellido_paterno,
      apellidoMaterno: raw?.apellidoMaterno ?? raw?.apellido_materno,
      archivos: Array.isArray(archivos) ? archivos : [],
      fechaRespuesta: raw?.fechaRespuesta ?? raw?.fecha_respuesta
    };
  }

  private normalizarFecha(valor: any): string {
    if (!valor) return '';
    if (typeof valor === 'string' && valor.length >= 10) {
      return valor.substring(0, 10);
    }
    return String(valor);
  }
}
