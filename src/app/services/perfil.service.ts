import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Perfil } from '../models/perfil';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private apiUrl = '/egresados';
  private readonly fotoDefault = 'assets/favicon-UNPA.ico';

  private fotoSubject = new BehaviorSubject<string>(this.fotoDefault);
  foto$ = this.fotoSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerMatriculaSesion(): string {
    const raw = sessionStorage.getItem('usuario');
    if (!raw) return '';
    try {
      return (JSON.parse(raw).matricula ?? '').trim();
    } catch {
      return '';
    }
  }

  obtenerPerfil(matricula: string): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.apiUrl}/perfil/${matricula}`);
  }

  subirFotoPerfil(matricula: string, archivo: File): Observable<{ urlFoto: string }> {
    const formData = new FormData();
    formData.append('file', archivo, archivo.name);
    return this.http.post<{ urlFoto?: string; url_foto?: string }>(
      `${this.apiUrl}/foto-perfil/${encodeURIComponent(matricula)}`,
      formData
    ).pipe(
      map(resp => ({
        urlFoto: resp.urlFoto ?? resp.url_foto ?? ''
      }))
    );
  }

  resolverUrlFoto(url?: string | null): string {
    if (!url) return this.fotoDefault;
    const cacheBust = `t=${Date.now()}`;
    if (/^(https?:|data:|blob:)/i.test(url)) {
      return `${url}${url.includes('?') ? '&' : '?'}${cacheBust}`;
    }
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${path}${path.includes('?') ? '&' : '?'}${cacheBust}`;
  }

  setFoto(url: string): void {
    this.fotoSubject.next(url || this.fotoDefault);
  }

  cargarFotoDesdePerfil(matricula?: string): void {
    const m = (matricula || this.obtenerMatriculaSesion()).trim();
    if (!m || !/^\d+$/.test(m)) return;

    this.obtenerPerfil(m).subscribe({
      next: (data) => {
        if (data?.urlFoto) {
          this.setFoto(this.resolverUrlFoto(data.urlFoto));
        }
      }
    });
  }
}
