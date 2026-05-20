import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { CrearSolicitudDto, RespuestaSolicitud, Solicitud, TipoSolicitud } from '../../models/solicitud.model';

type VistaAdmin = 'lista' | 'formulario';

@Component({
  selector: 'app-solicitar-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-info.component.html',
  styleUrl: './solicitar-info.component.css'
})
export class SolicitarInfoComponent implements OnInit {

  vista: VistaAdmin = 'lista';
  cargando = false;
  mensaje = '';
  mensajeError = '';

  historial: Solicitud[] = [];
  filtroTipo: '' | TipoSolicitud = '';

  form: CrearSolicitudDto = this.formularioVacio();
  /** Si está activo, la solicitud se publica como ARCHIVOS; si no, como INFORMACION. */
  habilitarSubidaArchivos = false;

  solicitudDetalle: Solicitud | null = null;
  respuestas: RespuestaSolicitud[] = [];
  cargandoRespuestas = false;
  mostrarModalRespuestas = false;

  mostrarModalEliminar = false;
  solicitudAEliminar: Solicitud | null = null;
  eliminando = false;

  mostrarModalCerrar = false;
  solicitudACerrar: Solicitud | null = null;
  cerrando = false;

  constructor(private solicitudService: SolicitudService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    const tipo = this.filtroTipo || undefined;
    this.solicitudService.listarAdmin(tipo).subscribe({
      next: (data) => {
        this.historial = data;
        this.cargando = false;
      },
      error: () => {
        this.historial = [];
        this.cargando = false;
        this.mensajeError = 'No se pudo cargar el listado. Verifica que el backend exponga /admin/solicitar-info';
      }
    });
  }

  abrirFormulario(): void {
    this.vista = 'formulario';
    this.form = this.formularioVacio();
    this.habilitarSubidaArchivos = false;
    this.limpiarMensajes();
  }

  cancelarFormulario(): void {
    this.vista = 'lista';
    this.form = this.formularioVacio();
    this.habilitarSubidaArchivos = false;
  }

  guardar(): void {
    if (!this.validarFormulario()) return;

    const peticion = this.habilitarSubidaArchivos
      ? this.solicitudService.crearArchivos(this.form)
      : this.solicitudService.crearInformacion(this.form);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.habilitarSubidaArchivos
          ? '✓ Solicitud publicada (los egresados subirán archivos)'
          : '✓ Solicitud publicada (respuesta en texto)';
        this.vista = 'lista';
        this.habilitarSubidaArchivos = false;
        this.cargarHistorial();
      },
      error: () => {
        this.mensajeError = this.habilitarSubidaArchivos
          ? '❌ Error al crear la solicitud con subida de archivos'
          : '❌ Error al crear la solicitud de información';
      }
    });
  }

  hintTipoRespuesta(): string {
    return this.habilitarSubidaArchivos
      ? 'Los egresados podrán subir uno o más archivos según tus instrucciones.'
      : 'Los egresados responderán con texto según tus instrucciones.';
  }

  verRespuestas(solicitud: Solicitud): void {
    if (!solicitud.idSolicitud) return;

    this.solicitudDetalle = solicitud;
    this.mostrarModalRespuestas = true;
    this.cargandoRespuestas = true;
    this.respuestas = [];

    this.solicitudService.listarRespuestas(solicitud.idSolicitud).subscribe({
      next: (data) => {
        this.respuestas = data;
        this.cargandoRespuestas = false;
      },
      error: () => {
        this.respuestas = [];
        this.cargandoRespuestas = false;
      }
    });
  }

  cerrarModalRespuestas(): void {
    this.mostrarModalRespuestas = false;
    this.solicitudDetalle = null;
    this.respuestas = [];
  }

  abrirModalCerrar(solicitud: Solicitud): void {
    if (!solicitud.idSolicitud) return;
    this.solicitudACerrar = solicitud;
    this.mostrarModalCerrar = true;
  }

  cerrarModalCerrar(): void {
    if (this.cerrando) return;
    this.mostrarModalCerrar = false;
    this.solicitudACerrar = null;
  }

  confirmarCerrar(): void {
    const solicitud = this.solicitudACerrar;
    if (!solicitud?.idSolicitud || this.cerrando) return;

    this.cerrando = true;
    this.solicitudService.cerrarSolicitud(solicitud.idSolicitud).subscribe({
      next: () => {
        this.cerrando = false;
        this.mostrarModalCerrar = false;
        this.solicitudACerrar = null;
        this.mensaje = '✓ Solicitud cerrada';
        this.cargarHistorial();
      },
      error: () => {
        this.cerrando = false;
        this.mensajeError = '❌ No se pudo cerrar la solicitud';
      }
    });
  }

  abrirModalEliminar(solicitud: Solicitud): void {
    if (!solicitud.idSolicitud) return;
    this.solicitudAEliminar = solicitud;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    if (this.eliminando) return;
    this.mostrarModalEliminar = false;
    this.solicitudAEliminar = null;
  }

  confirmarEliminar(): void {
    const solicitud = this.solicitudAEliminar;
    if (!solicitud?.idSolicitud || this.eliminando) return;

    this.eliminando = true;
    this.solicitudService.eliminarSolicitud(solicitud.idSolicitud).subscribe({
      next: () => {
        this.eliminando = false;
        this.mostrarModalEliminar = false;
        this.solicitudAEliminar = null;
        this.mensaje = '✓ Solicitud eliminada';
        if (this.solicitudDetalle?.idSolicitud === solicitud.idSolicitud) {
          this.cerrarModalRespuestas();
        }
        this.cargarHistorial();
      },
      error: () => {
        this.eliminando = false;
        this.mensajeError = '❌ No se pudo eliminar la solicitud';
      }
    });
  }

  etiquetaTipo(tipo: TipoSolicitud): string {
    return tipo === 'ARCHIVOS' ? 'Archivos' : 'Información';
  }

  estadoSolicitud(s: Solicitud): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(s.fechaInicio + 'T00:00:00');
    const fin = new Date(s.fechaFin + 'T23:59:59');
    if (hoy < inicio) return 'Programada';
    if (hoy > fin) return 'Vencida';
    if (s.activa === false) return 'Cerrada';
    return 'Activa';
  }

  puedeCerrarAnticipadamente(s: Solicitud): boolean {
    return this.estadoSolicitud(s) === 'Activa';
  }

  claseEstado(s: Solicitud): string {
    const e = this.estadoSolicitud(s);
    if (e === 'Activa') return 'estado-activa';
    if (e === 'Programada') return 'estado-programada';
    if (e === 'Vencida') return 'estado-vencida';
    return 'estado-cerrada';
  }

  urlDescarga(idArchivo?: number): string {
    return idArchivo ? this.solicitudService.urlDescargaArchivo(idArchivo) : '#';
  }

  nombreCompleto(r: RespuestaSolicitud): string {
    return [r.nombreEgresado, r.apellidoPaterno, r.apellidoMaterno].filter(Boolean).join(' ') || r.matricula || '—';
  }

  private validarFormulario(): boolean {
    this.limpiarMensajes();
    if (!this.form.titulo?.trim()) {
      this.mensajeError = 'El título es obligatorio';
      return false;
    }
    if (!this.form.descripcion?.trim()) {
      this.mensajeError = 'La descripción es obligatoria';
      return false;
    }
    if (!this.form.fechaInicio || !this.form.fechaFin) {
      this.mensajeError = 'Indica el periodo de respuesta';
      return false;
    }
    if (this.form.fechaFin < this.form.fechaInicio) {
      this.mensajeError = 'La fecha fin no puede ser anterior a la fecha inicio';
      return false;
    }
    return true;
  }

  private formularioVacio(): CrearSolicitudDto {
    const hoy = this.fechaHoyLocal();
    return { titulo: '', descripcion: '', fechaInicio: hoy, fechaFin: hoy };
  }

  private fechaHoyLocal(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  private limpiarMensajes(): void {
    this.mensaje = '';
    this.mensajeError = '';
  }
}
