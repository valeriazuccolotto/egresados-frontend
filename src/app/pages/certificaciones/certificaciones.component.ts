import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './certificaciones.component.html',
  styleUrls: ['./certificaciones.component.css']
})
export class CertificacionesComponent implements OnInit {

  constructor(private router: Router, private http: HttpClient) {}

  // ===== USER =====
  usuario = 'Valeria';

  // ===== UI =====
  menuOculto = false;
  mostrarPopup = false;
  mostrarFormulario = false;
  mensaje = '';

  // ===== DATA =====
  historial: any[] = [];
  certSeleccionado: any = null;

  // ===== FORM NUEVO =====
  form: any = {
    certNombre: '',
    certInicio: '',
    certFin: '',
    certObtencion: ''
  };

  // ================= INIT =================
  ngOnInit() {
    this.cargarHistorial();
  }

  // ================= CARGAR HISTORIAL =================
  cargarHistorial() {
    this.http.get<any[]>(
      'http://localhost:8181/egresado/certificaciones/A1234567'
    ).subscribe({
      next: (data) => {
        this.historial = data;
      },
      error: () => {
        this.historial = [];
        this.mostrarMensaje("❌ Error al cargar historial");
      }
    });
  }

  // ================= HEADER =================
  toggleMenu() {
    this.menuOculto = !this.menuOculto;
  }

  irNotificaciones() {
    this.router.navigate(['/notificaciones']);
  }

  togglePopup(event: Event) {
    event.stopPropagation();
    this.mostrarPopup = !this.mostrarPopup;
  }

  // ================= CREAR =================
  guardar() {

    if (this.certSeleccionado) {
      this.actualizarCertificacion();
      return;
    }

    const datos = {
      matricula: "A1234567",
      nombreCertificacion: this.form.certNombre,
      fechaInicio: this.form.certInicio,
      fechaFin: this.form.certFin,
      fechaObtencion: this.form.certObtencion
    };

    this.http.post('http://localhost:8181/egresado/certificaciones', datos)
      .subscribe({
        next: () => {

          this.mostrarMensaje("✓ Certificación guardada");
          this.resetForm();
          this.mostrarFormulario = false;

          this.cargarHistorial(); // 🔥 importante
        },
        error: () => this.mostrarMensaje("❌ Error al guardar")
      });
  }

  // ================= EDITAR =================
  actualizarCertificacion() {

    const datosActualizados = {
      matricula: "A1234567",
      idCertificacion: this.certSeleccionado.idCertificacion,
      nombreCertificacion: this.certSeleccionado.nombreCertificacion,
      fechaInicio: this.certSeleccionado.fechaInicio,
      fechaFin: this.certSeleccionado.fechaFin,
      fechaObtencion: this.certSeleccionado.fechaObtencion
    };

    this.http.put(
      `http://localhost:8181/egresado/certificaciones/${this.certSeleccionado.idCertificacion}`,
      datosActualizados
    ).subscribe({
      next: () => {

        this.mostrarMensaje("✓ Certificación actualizada");
        this.certSeleccionado = null;

        this.cargarHistorial(); // 🔥 importante
      },
      error: (err) => {
        console.log(err.error);
        this.mostrarMensaje("❌ Error al actualizar");
      }
    });
  }

  // ================= VER =================
  verDetalle(item: any) {
    this.certSeleccionado = { ...item };
  }

  // ================= CANCELAR =================
  cancelarEdicion() {
    this.certSeleccionado = null;
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.resetForm();
  }

  // ================= ELIMINAR =================
  eliminarCertificacion(idCertificacion: number) {

    this.http.delete(
      `http://localhost:8181/egresado/certificaciones/${idCertificacion}`
    ).subscribe({
      next: () => {

        this.mostrarMensaje("🗑️ Certificación eliminada correctamente");

        this.cargarHistorial(); // 🔥 importante

      },
      error: (err) => {
        console.log(err.error);
        this.mostrarMensaje("❌ Error al eliminar");
      }
    });

  }

  // ================= RESET =================
  resetForm() {
    this.form = {
      certNombre: '',
      certInicio: '',
      certFin: '',
      certObtencion: ''
    };
  }

  // ================= MENSAJE =================
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }
}