import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SolicitudService } from './solicitud.service';

@Injectable({ providedIn: 'root' })
export class AvisosPendientesService {

  private readonly pendientesSubject = new BehaviorSubject<boolean>(false);
  readonly hayPendientes$ = this.pendientesSubject.asObservable();

  constructor(private solicitudService: SolicitudService) {}

  get hayPendientes(): boolean {
    return this.pendientesSubject.value;
  }

  actualizar(matricula?: string): void {
    const m = matricula?.trim() || this.obtenerMatriculaSesion();
    if (!m) {
      this.pendientesSubject.next(false);
      return;
    }

    this.solicitudService.listarParaEgresado(m).subscribe({
      next: (avisos) => {
        const pendiente = avisos.some(a => a.puedeResponder === true);
        this.pendientesSubject.next(pendiente);
      },
      error: () => this.pendientesSubject.next(false)
    });
  }

  marcarSinPendientes(): void {
    this.pendientesSubject.next(false);
  }

  private obtenerMatriculaSesion(): string {
    const raw = sessionStorage.getItem('usuario');
    if (!raw) return '';
    try {
      return JSON.parse(raw).matricula ?? '';
    } catch {
      return '';
    }
  }
}
