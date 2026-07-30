import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudRegistro } from '../../models/solicitud-registro';
import { SolicitudRegistroService } from '../../services/solicitud-registro.service';

@Component({
  selector: 'app-solicitudes-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-registro.component.html',
  styleUrls: ['./solicitudes-registro.component.css']
})
export class SolicitudesRegistroComponent implements OnInit {

  solicitudes: SolicitudRegistro[] = [];
  filtroEstado = 'PENDIENTE';
  cargando = false;
  mensaje = '';
  errorMsg = '';

  solicitudSeleccionada: SolicitudRegistro | null = null;
  mostrarRechazo = false;
  motivoRechazo = '';
  procesando = false;

  constructor(private solicitudRegistroService: SolicitudRegistroService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.errorMsg = '';
    const estado = this.filtroEstado === 'TODAS' ? undefined : this.filtroEstado;

    this.solicitudRegistroService.listar(estado).subscribe({
      next: (data) => {
        this.solicitudes = data || [];
        this.cargando = false;
      },
      error: () => {
        this.solicitudes = [];
        this.cargando = false;
        this.errorMsg = 'Error al cargar las solicitudes.';
      }
    });
  }

  setFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.cargar();
  }

  nombreCompleto(s: SolicitudRegistro): string {
    return [s.nombre, s.apellidoPaterno, s.apellidoMaterno].filter(Boolean).join(' ');
  }

  aceptar(s: SolicitudRegistro): void {
    if (!s.idSolicitud || this.procesando) return;
    if (!confirm(`¿Aceptar el registro de ${this.nombreCompleto(s)} (${s.matricula})?`)) {
      return;
    }

    this.procesando = true;
    this.mensaje = '';
    this.errorMsg = '';
    this.solicitudRegistroService.aceptar(s.idSolicitud, this.matriculaAdmin()).subscribe({
      next: () => {
        this.procesando = false;
        this.mensaje = 'Solicitud aceptada. Se envió el correo con la contraseña temporal.';
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.errorMsg = err?.error?.mensaje || 'No se pudo aceptar la solicitud.';
      }
    });
  }

  abrirRechazo(s: SolicitudRegistro): void {
    this.solicitudSeleccionada = s;
    this.motivoRechazo = '';
    this.mostrarRechazo = true;
  }

  cerrarRechazo(): void {
    this.mostrarRechazo = false;
    this.solicitudSeleccionada = null;
    this.motivoRechazo = '';
  }

  confirmarRechazo(): void {
    if (!this.solicitudSeleccionada?.idSolicitud || this.procesando) return;
    const motivo = this.motivoRechazo.trim();
    if (!motivo) {
      this.errorMsg = 'Indica el motivo del rechazo.';
      return;
    }

    this.procesando = true;
    this.mensaje = '';
    this.errorMsg = '';
    this.solicitudRegistroService.rechazar(
      this.solicitudSeleccionada.idSolicitud,
      motivo,
      this.matriculaAdmin()
    ).subscribe({
      next: () => {
        this.procesando = false;
        this.cerrarRechazo();
        this.mensaje = 'Solicitud rechazada. Se envió el correo con el motivo.';
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.errorMsg = err?.error?.mensaje || 'No se pudo rechazar la solicitud.';
      }
    });
  }

  private matriculaAdmin(): string {
    try {
      const raw = sessionStorage.getItem('usuario');
      if (!raw) return 'ADMIN';
      const usuario = JSON.parse(raw);
      return String(usuario.matricula || 'ADMIN');
    } catch {
      return 'ADMIN';
    }
  }
}
