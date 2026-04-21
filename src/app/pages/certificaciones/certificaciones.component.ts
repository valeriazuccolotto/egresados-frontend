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

  // ===== USUARIO =====
  usuario = 'Valeria';

  // ===== UI =====
  menuOculto = false;
  mostrarPopup = false;
  mostrarFormulario = false;
  mensaje = '';

  // ===== FORM =====
  form: any = {
    certNombre: '',
    certInicio: '',
    certFin: '',
    certObtencion: ''
  };

  // ===== HEADER =====
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

  // ===== GUARDAR CERTIFICACIÓN =====
  guardar() {

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
        },
        error: () => this.mostrarMensaje("❌ Error al guardar certificación")
      });
  }

  // ===== RESET FORM =====
  resetForm() {
    this.form = {
      certNombre: '',
      certInicio: '',
      certFin: '',
      certObtencion: ''
    };
  }

  // ===== MENSAJE =====
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }

  nuevo() {
  this.mostrarFormulario = true;
}

}