import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, interval } from 'rxjs';
import { SolicitudRegistroService } from './solicitud-registro.service';

@Injectable({ providedIn: 'root' })
export class SolicitudesPendientesAdminService implements OnDestroy {

  private readonly pendientesSubject = new BehaviorSubject<boolean>(false);
  readonly hayPendientes$ = this.pendientesSubject.asObservable();

  private pollSub?: Subscription;

  constructor(private solicitudRegistroService: SolicitudRegistroService) {}

  get hayPendientes(): boolean {
    return this.pendientesSubject.value;
  }

  iniciarPolling(intervaloMs = 45000): void {
    this.actualizar();
    this.pollSub?.unsubscribe();
    this.pollSub = interval(intervaloMs).subscribe(() => this.actualizar());
  }

  actualizar(): void {
    this.solicitudRegistroService.listar('PENDIENTE').subscribe({
      next: (solicitudes) => this.pendientesSubject.next(solicitudes.length > 0),
      error: () => this.pendientesSubject.next(false)
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}
