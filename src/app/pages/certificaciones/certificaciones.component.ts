import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule,RouterModule],

  templateUrl: './certificaciones.component.html',
  styleUrls: ['./certificaciones.component.css']
})
export class CertificacionesComponent implements OnInit {

  constructor(private router: Router, private http: HttpClient) {}

  matriculaUsuario: string = '';


  // ===== UI =====
  menuOculto = false;
  mostrarPopup = false;
  mostrarFormulario = false;
  mostrarConfirmacion = false;   // 🔥 para el modal de confirmación
  mensaje = '';

  // ===== DATA =====
  historial: any[] = [];
  certSeleccionado: any = null;
  certAEliminar: number | null = null; // 🔥 id temporal para eliminar

  // ===== FORM NUEVO =====
  form: any = {
    certNombre: '',
    certInicio: '',
    certFin: '',
    certObtencion: '',
    certInstitucion: ''   // 🔥 nuevo campo
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
  this.http.get<any[]>(
    `/egresado/certificaciones/${this.matriculaUsuario}`
  ).subscribe({
    next: (data) => this.historial = data,
    error: () => {
      this.historial = [];
      this.mostrarMensaje("❌ Error al cargar historial");
    }
  });
}

  // ================= HEADER =================
  toggleMenu() { this.menuOculto = !this.menuOculto; }
  irNotificaciones() { this.router.navigate(['/notificaciones']); }
  togglePopup(event: Event) {
    event.stopPropagation();
    this.mostrarPopup = !this.mostrarPopup;
  }

  // ================= CREAR =================
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.certSeleccionado = null; // 🔥 ocultar historial
    const hoy = this.getToday();
    this.form = {
      certNombre: '',
      certInicio: hoy,
      certFin: hoy,
      certObtencion: hoy,
      certInstitucion: ''
    };
  }
  getToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

  this.http.post('/egresado/certificaciones', datos)
    .subscribe({
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

    this.http.put(
      `/egresado/certificaciones/${this.certSeleccionado.idCertificacion}`,
      datosActualizados
    ).subscribe({
      next: () => {
        this.mostrarMensaje("✓ Certificación actualizada");
        this.certSeleccionado = null; // 🔥 volver a mostrar historial
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
      this.http.delete(
        `/egresado/certificaciones/${this.certAEliminar}`
      ).subscribe({
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
    this.form = {
      certNombre: '',
      certInicio: '',
      certFin: '',
      certObtencion: '',
      certInstitucion: ''   // 🔥 nuevo campo
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
