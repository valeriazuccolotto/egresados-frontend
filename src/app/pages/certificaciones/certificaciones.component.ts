import { Component } from '@angular/core';
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
export class CertificacionesComponent {

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

    // 🔴 SI ESTÁS EDITANDO
    if (this.certSeleccionado) {
      this.actualizarCertificacion();
      return;
    }

    // 🔵 SI ESTÁS CREANDO
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

          this.historial.push({
            id: Date.now(),
            ...datos
          });

          this.mostrarMensaje("✓ Certificación guardada");
          this.resetForm();
          this.mostrarFormulario = false;
        },
        error: () => this.mostrarMensaje("❌ Error al guardar")
      });
  }

  // ================= EDITAR (UPDATE REAL) =================
  actualizarCertificacion() {

    const datosActualizados = {
      id: this.certSeleccionado.id,
      nombreCertificacion: this.certSeleccionado.nombreCertificacion,
      fechaInicio: this.certSeleccionado.fechaInicio,
      fechaFin: this.certSeleccionado.fechaFin,
      fechaObtencion: this.certSeleccionado.fechaObtencion
    };

    this.http.put(`http://localhost:8181/egresado/certificaciones/${this.certSeleccionado.id}`, datosActualizados)
      .subscribe({
        next: () => {

          // 🔥 ACTUALIZAR LISTA LOCAL SIN DUPLICAR
          const index = this.historial.findIndex(c => c.id === this.certSeleccionado.id);

          if (index !== -1) {
            this.historial[index] = { ...this.certSeleccionado };
          }

          this.mostrarMensaje("✓ Certificación actualizada");
          this.certSeleccionado = null;
        },
        error: () => this.mostrarMensaje("❌ Error al actualizar")
      });
  }

  // ================= VER =================
  verDetalle(item: any) {
    this.certSeleccionado = { ...item }; // copia segura
  }

  // ================= CANCELAR EDICIÓN =================
  cancelarEdicion() {
    this.certSeleccionado = null;
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.resetForm();
  }

  // ================= ELIMINAR =================
  eliminarCertificacion(id: number) {
    this.historial = this.historial.filter(c => c.id !== id);
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