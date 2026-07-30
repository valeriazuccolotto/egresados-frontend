import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  CrearSolicitudDto,
  EnviarRespuestaInformacionDto,
  RespuestaSolicitud,
  Solicitud,
  TipoSolicitud
} from '../models/solicitud';

@Injectable({ providedIn: 'root' })
export class SolicitudService {

  private readonly adminUrl = '/admin/solicitar-info';
  private readonly egresadoUrl = '/egresados/solicitar-info';

  constructor(private http: HttpClient) {}

  // ——— Admin ———

  listarAdmin(tipo?: TipoSolicitud): Observable<Solicitud[]> {
    const query = tipo ? `?tipo=${tipo}` : '';
    return this.http.get<any[]>(`${this.adminUrl}${query}`).pipe(
      map(list => (list || []).map(s => this.normalizarSolicitud(s)))
    );
  }

  crearInformacion(dto: CrearSolicitudDto): Observable<Solicitud> {
    return this.http.post<any>(`${this.adminUrl}/informacion`, { ...dto, tipo: 'INFORMACION' }).pipe(
      map(s => this.normalizarSolicitud(s))
    );
  }

  crearArchivos(dto: CrearSolicitudDto): Observable<Solicitud> {
    return this.http.post<any>(`${this.adminUrl}/archivos`, { ...dto, tipo: 'ARCHIVOS' }).pipe(
      map(s => this.normalizarSolicitud(s))
    );
  }

  cerrarSolicitud(idSolicitud: number): Observable<void> {
    return this.http.patch<void>(`${this.adminUrl}/${idSolicitud}/cerrar`, {});
  }

  eliminarSolicitud(idSolicitud: number): Observable<void> {
    return this.http.post<void>(`${this.adminUrl}/${idSolicitud}/eliminar`, {});
  }

  listarRespuestas(idSolicitud: number): Observable<RespuestaSolicitud[]> {
    return this.http.get<any[]>(`${this.adminUrl}/${idSolicitud}/respuestas`).pipe(
      map(list => (list || []).map(r => this.normalizarRespuesta(r)))
    );
  }

  urlDescargaArchivo(idArchivo: number): string {
    return `${this.adminUrl}/archivos/${idArchivo}/descargar`;
  }

  // ——— Egresado ———

  listarParaEgresado(matricula: string): Observable<Solicitud[]> {
    const m = encodeURIComponent((matricula || '').trim());
    return this.http.get<any[]>(`${this.egresadoUrl}/${m}`).pipe(
      map(list => (list || []).map(s => this.normalizarSolicitud(s)))
    );
  }

  obtenerParaEgresado(matricula: string, idSolicitud: number): Observable<Solicitud> {
    const m = encodeURIComponent(matricula);
    return this.http.get<any>(`${this.egresadoUrl}/${m}/${idSolicitud}`).pipe(
      map(s => this.normalizarSolicitud(s))
    );
  }

  obtenerMiRespuesta(matricula: string, idSolicitud: number): Observable<RespuestaSolicitud> {
    const m = encodeURIComponent(matricula);
    return this.http.get<any>(`${this.egresadoUrl}/${m}/${idSolicitud}/mi-respuesta`).pipe(
      map(r => this.normalizarRespuesta(r))
    );
  }

  responderInformacion(
    matricula: string,
    idSolicitud: number,
    dto: EnviarRespuestaInformacionDto
  ): Observable<RespuestaSolicitud> {
    const m = encodeURIComponent(matricula);
    return this.http.post<any>(`${this.egresadoUrl}/${m}/${idSolicitud}/respuesta`, dto).pipe(
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
      `${this.egresadoUrl}/${m}/${idSolicitud}/respuesta-archivos`,
      formData
    ).pipe(
      map(r => this.normalizarRespuesta(r))
    );
  }

  private normalizarSolicitud(raw: any): Solicitud {
    const fechaInicio = this.normalizarFecha(raw?.fechaInicio ?? raw?.fecha_inicio);
    const fechaFin = this.normalizarFecha(raw?.fechaFin ?? raw?.fecha_fin);
    const activa = raw?.activa === false || raw?.activa === 'false' ? false : true;
    const yaRespondio = !!(raw?.yaRespondio ?? raw?.ya_respondio ?? false);
    let puedeResponder = raw?.puedeResponder ?? raw?.puede_responder;
    if (puedeResponder === undefined || puedeResponder === null) {
      puedeResponder = this.calcularPuedeResponder(activa, yaRespondio, fechaInicio, fechaFin);
    } else {
      puedeResponder = !!puedeResponder;
    }
    let estadoEgresado = (raw?.estadoEgresado ?? raw?.estado_egresado ?? '').toUpperCase();
    if (!estadoEgresado) {
      estadoEgresado = yaRespondio ? 'RESPONDIDA' : (puedeResponder ? 'PENDIENTE' : 'VENCIDA');
    }
    return {
      idSolicitud: raw?.idSolicitud ?? raw?.id_solicitud,
      tipo: (raw?.tipo || 'INFORMACION').toUpperCase() as TipoSolicitud,
      titulo: raw?.titulo ?? '',
      descripcion: raw?.descripcion ?? '',
      fechaInicio,
      fechaFin,
      activa,
      creadoPor: raw?.creadoPor ?? raw?.creado_por,
      fechaCreacion: raw?.fechaCreacion ?? raw?.fecha_creacion,
      yaRespondio,
      puedeResponder,
      estadoEgresado: estadoEgresado as Solicitud['estadoEgresado']
    };
  }

  private calcularPuedeResponder(
    activa: boolean,
    yaRespondio: boolean,
    fechaInicio: string,
    fechaFin: string
  ): boolean {
    if (yaRespondio || !activa || !fechaInicio || !fechaFin) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T23:59:59');
    return hoy >= inicio && hoy <= fin;
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
