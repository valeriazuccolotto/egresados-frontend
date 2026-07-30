import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificacionesService } from '../../services/certificaciones.service';
import { fechaHoyLocal } from '../../utils/fecha-hoy.util';

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificaciones.component.html',
  styleUrls: ['./certificaciones.component.css']
})
export class CertificacionesComponent implements OnInit {

  constructor(private certificacionesService: CertificacionesService) {}

  matriculaUsuario: string = '';

  // ===== UI =====
  mostrarFormulario = false;
  mostrarConfirmacion = false;
  mensaje = '';

  // ===== DATA =====
  historial: any[] = [];
  certSeleccionado: any = null;
  certAEliminar: number | null = null;

  // ===== FORM NUEVO =====
  form: any = {
    certNombre: '',
    certInicio: '',
    certFin: '',
    certObtencion: '',
    certInstitucion: ''
  };

  ngOnInit() {
  const raw = sessionStorage.getItem('usuario');

  if (!raw) {
    this.mostrarMensaje("❌ No hay sesión activa");
    return;
  }

  const usuario = JSON.parse(raw);
  this.matriculaUsuario = usuario.matricula;

  this.cargarHistorial();
}
  cargarHistorial() {
    this.certificacionesService.getPorMatricula(this.matriculaUsuario).subscribe({
      next: (data) => this.historial = data || [],
      error: () => {
        this.historial = [];
        this.mostrarMensaje("❌ Error al cargar historial");
      }
    });
  }

  // ================= CREAR =================
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.certSeleccionado = null;
    this.resetForm();
  }



  guardar() {
  if (this.certSeleccionado) {
    this.actualizarCertificacion();
    return;
  }

  const datos = {
    matricula: this.matriculaUsuario,  // ✅ AQUÍ EL CAMBIO
    nombreCertificacion: this.form.certNombre,
    fechaInicio: this.form.certInicio,
    fechaFin: this.form.certFin,
    fechaObtencion: this.form.certObtencion,
    institucionCertificacion: this.form.certInstitucion
  };

  this.certificacionesService.guardar(datos).subscribe({
    next: () => {
      this.mostrarMensaje("✓ Certificación guardada");
      this.resetForm();
      this.mostrarFormulario = false;
      this.cargarHistorial();
    },
    error: () => this.mostrarMensaje("❌ Error al guardar")
  });
}

  // ================= EDITAR =================
  verDetalle(item: any) {
    this.certSeleccionado = { ...item };
    this.mostrarFormulario = false; // 🔥 ocultar historial
  }

  actualizarCertificacion() {
    const datosActualizados = {
      matricula: this.matriculaUsuario,
      idCertificacion: this.certSeleccionado.idCertificacion,
      nombreCertificacion: this.certSeleccionado.nombreCertificacion,
      fechaInicio: this.certSeleccionado.fechaInicio,
      fechaFin: this.certSeleccionado.fechaFin,
      fechaObtencion: this.certSeleccionado.fechaObtencion,
      institucionCertificacion: this.certSeleccionado.institucionCertificacion   // 🔥 nuevo campo
    };

    const id = this.certSeleccionado.idCertificacion;
    this.certificacionesService.actualizar(id, datosActualizados).subscribe({
      next: () => {
        this.mostrarMensaje("✓ Certificación actualizada");
        this.certSeleccionado = null;
        this.cargarHistorial();
      },
      error: () => this.mostrarMensaje("❌ Error al actualizar")
    });
  }

  cancelarEdicion() {
    this.certSeleccionado = null; // 🔥 volver a mostrar historial
  }

  cancelarFormulario() {
    this.mostrarFormulario = false; // 🔥 volver a mostrar historial
    this.resetForm();
  }

  // ================= ELIMINAR =================
  abrirConfirmacion(idCertificacion: number) {
    this.certAEliminar = idCertificacion;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminacion() {
    if (this.certAEliminar !== null) {
      const id = this.certAEliminar;
      this.certificacionesService.eliminar(id).subscribe({
        next: () => {
          this.mostrarMensaje("🗑️ Certificación eliminada correctamente");
          this.cargarHistorial();
          this.cerrarConfirmacion();
        },
        error: (err) => {
          console.log(err.error);
          this.mostrarMensaje("❌ Error al eliminar");
          this.cerrarConfirmacion();
        }
      });
    }
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.certAEliminar = null;
  }

  // ================= RESET =================
  resetForm() {
    const hoy = fechaHoyLocal();
    this.form = {
      certNombre: '',
      certInicio: hoy,
      certFin: hoy,
      certObtencion: hoy,
      certInstitucion: ''
    };
  }

  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }

mostrarConsulta = false;
certificacionConsulta: any = null;

abrirConsulta(cert: any) {
  this.certificacionConsulta = cert;
  this.mostrarConsulta = true;
}

cerrarConsulta() {
  this.mostrarConsulta = false;
  this.certificacionConsulta = null;
}
}
