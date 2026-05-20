import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { AvisosPendientesService } from '../../services/avisos-pendientes.service';
import { RespuestaSolicitud, Solicitud } from '../../models/solicitud.model';
import { Usuario } from '../../models/usuario';

type VistaAvisos = 'lista' | 'detalle';

@Component({
  selector: 'app-nuevos-avisos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevos-avisos.component.html',
  styleUrl: './nuevos-avisos.component.css'
})
export class NuevosAvisosComponent implements OnInit {

  matricula = '';
  vista: VistaAvisos = 'lista';
  cargando = false;
  enviando = false;
  mensaje = '';
  mensajeError = '';

  avisos: Solicitud[] = [];
  avisoSeleccionado: Solicitud | null = null;
  miRespuesta: RespuestaSolicitud | null = null;

  contenido = '';
  comentario = '';
  archivosSeleccionados: File[] = [];

  constructor(
    private solicitudService: SolicitudService,
    private avisosPendientesService: AvisosPendientesService
  ) {}

  ngOnInit(): void {
    const raw = sessionStorage.getItem('usuario');
    if (!raw) {
      this.mensajeError = 'No hay sesión activa. Inicia sesión nuevamente.';
      return;
    }
    const usuario: Usuario = JSON.parse(raw);
    this.matricula = (usuario.matricula || '').trim();
    this.cargarAvisos();
  }

  cargarAvisos(): void {
    if (!this.matricula) return;
    this.cargando = true;
    this.limpiarMensajes();
    this.solicitudService.listarParaEgresado(this.matricula).subscribe({
      next: (data) => {
        this.avisos = (data || []).filter(a => !!a.idSolicitud);
        this.cargando = false;
        this.avisosPendientesService.actualizar(this.matricula);
      },
      error: (err) => {
        this.avisos = [];
        this.cargando = false;
        this.mensajeError = this.extraerError(err) || 'No se pudieron cargar los avisos';
      }
    });
  }

  abrirDetalle(aviso: Solicitud): void {
    if (!aviso.idSolicitud) return;
    this.vista = 'detalle';
    this.avisoSeleccionado = aviso;
    this.contenido = '';
    this.comentario = '';
    this.archivosSeleccionados = [];
    this.miRespuesta = null;
    this.limpiarMensajes();

    this.solicitudService.obtenerParaEgresado(this.matricula, aviso.idSolicitud).subscribe({
      next: (detalle) => {
        this.avisoSeleccionado = detalle;
        if (detalle.yaRespondio) {
          this.cargarMiRespuesta(aviso.idSolicitud!);
        }
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar el detalle del aviso';
      }
    });
  }

  volverLista(): void {
    this.vista = 'lista';
    this.avisoSeleccionado = null;
    this.miRespuesta = null;
    this.contenido = '';
    this.comentario = '';
    this.archivosSeleccionados = [];
    this.limpiarMensajes();
    this.cargarAvisos();
  }

  onArchivosChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivosSeleccionados = input.files ? Array.from(input.files) : [];
  }

  enviarRespuesta(): void {
    const aviso = this.avisoSeleccionado;
    if (!aviso?.idSolicitud || !aviso.puedeResponder) return;

    this.enviando = true;
    this.limpiarMensajes();

    if (aviso.tipo === 'ARCHIVOS') {
      if (this.archivosSeleccionados.length === 0) {
        this.enviando = false;
        this.mensajeError = 'Selecciona al menos un archivo';
        return;
      }
      this.solicitudService.responderArchivos(
        this.matricula,
        aviso.idSolicitud,
        this.archivosSeleccionados,
        this.comentario
      ).subscribe({
        next: () => this.onRespuestaEnviada(),
        error: (err) => this.onErrorEnvio(err)
      });
      return;
    }

    if (!this.contenido?.trim()) {
      this.enviando = false;
      this.mensajeError = 'Escribe tu respuesta antes de enviar';
      return;
    }

    this.solicitudService.responderInformacion(this.matricula, aviso.idSolicitud, {
      contenido: this.contenido.trim(),
      comentario: this.comentario?.trim() || undefined
    }).subscribe({
      next: () => this.onRespuestaEnviada(),
      error: (err) => this.onErrorEnvio(err)
    });
  }

  etiquetaTipo(tipo: string): string {
    return tipo === 'ARCHIVOS' ? 'Archivos' : 'Información';
  }

  etiquetaEstado(aviso: Solicitud): string {
    const e = this.estadoDe(aviso);
    if (e === 'RESPONDIDA') return 'Respondida';
    if (e === 'PENDIENTE') return 'Pendiente';
    if (e === 'VENCIDA') return 'Vencida';
    return 'No disponible';
  }

  claseEstado(aviso: Solicitud): string {
    const e = this.estadoDe(aviso);
    if (e === 'RESPONDIDA') return 'estado-respondida';
    if (e === 'PENDIENTE') return 'estado-pendiente';
    if (e === 'VENCIDA') return 'estado-vencida';
    return 'estado-cerrada';
  }

  mostrarBotonResponder(aviso: Solicitud): boolean {
    return this.estadoDe(aviso) === 'PENDIENTE';
  }

  mostrarBotonVerRespuesta(aviso: Solicitud): boolean {
    return this.estadoDe(aviso) === 'RESPONDIDA';
  }

  avisoVencidoSinRespuesta(aviso: Solicitud | null): boolean {
    return !!aviso && this.estadoDe(aviso) === 'VENCIDA';
  }

  private estadoDe(aviso: Solicitud): 'PENDIENTE' | 'VENCIDA' | 'RESPONDIDA' | '' {
    const estado = (aviso.estadoEgresado || '').toUpperCase();
    if (estado === 'PENDIENTE' || estado === 'VENCIDA' || estado === 'RESPONDIDA') {
      return estado;
    }
    if (aviso.yaRespondio) return 'RESPONDIDA';
    if (aviso.puedeResponder) return 'PENDIENTE';
    return 'VENCIDA';
  }

  private cargarMiRespuesta(idSolicitud: number): void {
    this.solicitudService.obtenerMiRespuesta(this.matricula, idSolicitud).subscribe({
      next: (r) => this.miRespuesta = r,
      error: () => {
        this.miRespuesta = null;
      }
    });
  }

  private onRespuestaEnviada(): void {
    this.enviando = false;
    this.mensaje = '✓ Tu respuesta se envió correctamente';
    const id = this.avisoSeleccionado?.idSolicitud;
    if (id) {
      this.solicitudService.obtenerParaEgresado(this.matricula, id).subscribe({
        next: (detalle) => {
          this.avisoSeleccionado = detalle;
          if (detalle.yaRespondio) {
            this.cargarMiRespuesta(id);
          }
          this.avisosPendientesService.actualizar(this.matricula);
        }
      });
    } else {
      this.avisosPendientesService.actualizar(this.matricula);
    }
  }

  private onErrorEnvio(err: unknown): void {
    this.enviando = false;
    this.mensajeError = this.extraerError(err) || 'No se pudo enviar la respuesta';
  }

  private extraerError(err: any): string {
    if (typeof err?.error === 'string') return err.error;
    if (err?.error?.message) return err.error.message;
    return '';
  }

  private limpiarMensajes(): void {
    this.mensaje = '';
    this.mensajeError = '';
  }
}
