import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

  /** Misma regla que login: 8 dígitos con ceros a la izquierda. */
  normalizarMatricula(matricula: string | null | undefined): string {
    const m = (matricula ?? '').trim();
    if (!m) {
      return '';
    }
    if (/^\d+$/.test(m)) {
      return m.padStart(8, '0');
    }
    return m;
  }

  obtenerMatriculaSesion(): string {
    const raw = sessionStorage.getItem('usuario');
    if (!raw) {
      return '';
    }
    try {
      return this.normalizarMatricula(JSON.parse(raw).matricula);
    } catch {
      return '';
    }
  }

  obtenerPerfil(matricula: string): Observable<Perfil> {
    const m = this.normalizarMatricula(matricula);
    return this.http.get<Perfil>(`${this.apiUrl}/perfil/${encodeURIComponent(m)}`);
  }

  subirFotoPerfil(matricula: string, archivo: File): Observable<{ urlFoto: string }> {
    const m = this.normalizarMatricula(matricula);
    const formData = new FormData();
    formData.append('file', archivo, archivo.name);

    return this.http.post<Record<string, unknown>>(
      `${this.apiUrl}/foto-perfil/${encodeURIComponent(m)}`,
      formData
    ).pipe(
      map(resp => ({
        urlFoto: String(resp?.['urlFoto'] ?? resp?.['url_foto'] ?? '')
      })),
      tap(resp => {
        if (resp.urlFoto) {
          this.setFoto(this.resolverUrlFoto(resp.urlFoto));
        }
      })
    );
  }

  resolverUrlFoto(url?: string | null): string {
    if (!url || !String(url).trim()) {
      return this.fotoDefault;
    }
    const limpia = String(url).trim();
    const cacheBust = `t=${Date.now()}`;
    if (/^(https?:|data:|blob:)/i.test(limpia)) {
      return `${limpia}${limpia.includes('?') ? '&' : '?'}${cacheBust}`;
    }
    const path = limpia.startsWith('/') ? limpia : `/${limpia}`;
    return `${path}${path.includes('?') ? '&' : '?'}${cacheBust}`;
  }

  setFoto(url: string): void {
    this.fotoSubject.next(this.resolverUrlFoto(url));
  }

  fotoPorDefecto(): string {
    return this.fotoDefault;
  }

  cargarFotoDesdePerfil(matricula?: string): void {
    const m = this.normalizarMatricula(matricula || this.obtenerMatriculaSesion());
    if (!m || !/^\d{8}$/.test(m)) {
      return;
    }

    this.obtenerPerfil(m).subscribe({
      next: (data) => {
        if (data?.urlFoto) {
          this.setFoto(data.urlFoto);
        }
      },
      error: (err) => {
        console.warn('No se pudo cargar la foto de perfil:', err);
      }
    });
  }
}
