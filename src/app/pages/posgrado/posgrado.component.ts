import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-posgrado',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './posgrado.component.html',
  styleUrls: ['./posgrado.component.css']
})
export class PosgradoComponent {

  constructor(private router: Router, private http: HttpClient) {}

  // ===== USUARIO =====
  usuario = 'Valeria';

  // ===== UI =====
  menuOculto = false;
  mostrarPopup = false;

  // 🔴 IMPORTANTE: control del botón añadir
  mostrarPosgrado = false;

  mensaje = '';

  // ===== FORM POSGRADO =====
  form: any = {
    nivel: '',
    institucion: '',
    programa: '',
    modalidad: '',
    estatus: '',
    relacion: '',
    inicio: '',
    fin: '',
    tieneBeca: false
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

  // ===== ABRIR FORMULARIO =====
  abrirFormulario() {
    this.mostrarPosgrado = true;
  }

  // ===== CERRAR FORMULARIO =====
  cancelar() {
    this.mostrarPosgrado = false;
  }

  // ===== GUARDAR POSGRADO =====
  guardar() {

    const datos = {
      matricula: "A1234567",

      nivelEstudio: this.form.nivel,
      institucion: this.form.institucion,
      nombrePrograma: this.form.programa,

      modalidad: this.form.modalidad,
      estatus: this.form.estatus,
      relacionadoCarrera: this.form.relacion,

      fechaInicio: this.form.inicio,
      fechaFin: this.form.fin,

      tieneBeca: this.form.tieneBeca
    };

    this.http.post('http://localhost:8181/egresado/posgrado', datos)
      .subscribe({
        next: () => {
          this.mostrarMensaje("✓ Posgrado guardado");
          this.mostrarPosgrado = false; // cerrar formulario
          this.resetForm(); // limpiar campos
        },
        error: () => this.mostrarMensaje("❌ Error al guardar posgrado")
      });
  }

  // ===== LIMPIAR FORM =====
  resetForm() {
    this.form = {
      nivel: '',
      institucion: '',
      programa: '',
      modalidad: '',
      estatus: '',
      relacion: '',
      inicio: '',
      fin: '',
      tieneBeca: false
    };
  }

  // ===== MENSAJE =====
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }
}