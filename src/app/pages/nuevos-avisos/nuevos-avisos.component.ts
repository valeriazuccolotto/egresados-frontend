import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { AvisosPendientesService } from '../../services/avisos-pendientes.service';
import { Solicitud } from '../../models/solicitud';
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

  comentario = '';
  archivosSeleccionados: File[] = [];

  mostrarModalConfirmarArchivos = false;

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
    this.limpiarMensajes(false);
    this.solicitudService.listarParaEgresado(this.matricula).subscribe({
      next: (data) => {
        this.avisos = (data || []).filter(a => !!a.idSolicitud && !!a.puedeResponder);
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
    this.comentario = '';
    this.archivosSeleccionados = [];
    this.mostrarModalConfirmarArchivos = false;
    this.limpiarMensajes();

    this.solicitudService.obtenerParaEgresado(this.matricula, aviso.idSolicitud).subscribe({
      next: (detalle) => {
        this.avisoSeleccionado = detalle;
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar el detalle del aviso';
      }
    });
  }

  volverLista(conservarMensaje = false): void {
    this.vista = 'lista';
    this.avisoSeleccionado = null;
    this.comentario = '';
    this.archivosSeleccionados = [];
    this.mostrarModalConfirmarArchivos = false;
    if (!conservarMensaje) {
      this.limpiarMensajes();
    }
    this.cargarAvisos();
  }

  onArchivosChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevos = input.files ? Array.from(input.files) : [];
    if (nuevos.length) {
      const existentes = new Set(
        this.archivosSeleccionados.map(f => `${f.name}|${f.size}|${f.lastModified}`)
      );
      for (const archivo of nuevos) {
        const clave = `${archivo.name}|${archivo.size}|${archivo.lastModified}`;
        if (!existentes.has(clave)) {
          this.archivosSeleccionados = [...this.archivosSeleccionados, archivo];
          existentes.add(clave);
        }
      }
    }
    input.value = '';
  }

  quitarArchivo(indice: number): void {
    if (indice < 0 || indice >= this.archivosSeleccionados.length) {
      return;
    }
    this.archivosSeleccionados = this.archivosSeleccionados.filter((_, i) => i !== indice);
  }

  formatoTamano(bytes: number): string {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  marcarRealizado(): void {
    const aviso = this.avisoSeleccionado;
    if (!aviso?.idSolicitud || !aviso.puedeResponder || aviso.tipo !== 'INFORMACION') {
      return;
    }

    this.enviando = true;
    this.limpiarMensajes();

    this.solicitudService.responderInformacion(this.matricula, aviso.idSolicitud, {
      contenido: 'Realizado'
    }).subscribe({
      next: () => this.onRespuestaEnviada('✓ Aviso marcado como realizado'),
      error: (err) => this.onErrorEnvio(err)
    });
  }

  abrirConfirmacionArchivos(): void {
    if (this.archivosSeleccionados.length === 0) {
      this.mensajeError = 'Selecciona al menos un archivo';
      return;
    }
    this.limpiarMensajes();
    this.mostrarModalConfirmarArchivos = true;
  }

  cerrarConfirmacionArchivos(): void {
    if (this.enviando) {
      return;
    }
    this.mostrarModalConfirmarArchivos = false;
  }

  confirmarEnvioArchivos(): void {
    const aviso = this.avisoSeleccionado;
    if (!aviso?.idSolicitud || !aviso.puedeResponder || aviso.tipo !== 'ARCHIVOS') {
      return;
    }
    if (this.archivosSeleccionados.length === 0) {
      this.mostrarModalConfirmarArchivos = false;
      this.mensajeError = 'Selecciona al menos un archivo';
      return;
    }

    this.enviando = true;
    this.limpiarMensajes();

    this.solicitudService.responderArchivos(
      this.matricula,
      aviso.idSolicitud,
      this.archivosSeleccionados,
      this.comentario
    ).subscribe({
      next: () => {
        this.mostrarModalConfirmarArchivos = false;
        this.onRespuestaEnviada('✓ Archivos enviados correctamente');
      },
      error: (err) => {
        this.mostrarModalConfirmarArchivos = false;
        this.onErrorEnvio(err);
      }
    });
  }

  etiquetaTipo(tipo: string): string {
    return tipo === 'ARCHIVOS' ? 'Archivos' : 'Aviso';
  }

  textoPeriodo(aviso: Solicitud): string {
    if (aviso.fechaInicio && aviso.fechaFin) {
      return `${aviso.fechaInicio} — ${aviso.fechaFin}`;
    }
    return 'Sin periodo definido';
  }

  textoCarreras(aviso: Solicitud): string {
    const nombres = (aviso.carreras || [])
      .map(c => c.nombreCarrera || c.claveCarrera)
      .filter(Boolean);
    return nombres.join(', ');
  }

  etiquetaEstado(aviso: Solicitud): string {
    if (aviso.puedeResponder) return 'Pendiente';
    return 'No disponible';
  }

  claseEstado(aviso: Solicitud): string {
    if (aviso.puedeResponder) return 'estado-pendiente';
    return 'estado-cerrada';
  }

  mostrarBotonResponder(aviso: Solicitud): boolean {
    return !!aviso.puedeResponder;
  }

  private onRespuestaEnviada(mensajeExito: string): void {
    this.enviando = false;
    this.mensaje = mensajeExito;
    this.comentario = '';
    this.archivosSeleccionados = [];
    this.avisosPendientesService.actualizar(this.matricula);
    this.volverLista(true);
  }

  private onErrorEnvio(err: unknown): void {
    this.enviando = false;
    this.mensajeError = this.extraerError(err) || 'No se pudo completar la acción';
  }

  private extraerError(err: any): string {
    if (typeof err?.error === 'string') return err.error;
    if (err?.error?.message) return err.error.message;
    return '';
  }

  private limpiarMensajes(limpiarExito = true): void {
    if (limpiarExito) {
      this.mensaje = '';
    }
    this.mensajeError = '';
  }
}
