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
  mostrarPosgrado = false;
  mensaje = '';

  // ===== HISTORIAL =====
  historial: any[] = [];
  posgradoSeleccionado: any = null;

  // ===== FORM =====
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

  // ================= ABRIR / CERRAR =================
  abrirFormulario() {
    this.mostrarPosgrado = true;
  }

  cancelar() {
    this.mostrarPosgrado = false;
    this.resetForm();
  }

  // ================= GUARDAR (CREAR) =================
  guardar() {

    const datos = {
      id: Date.now(),
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

          this.historial.push(datos);

          this.mostrarMensaje("✓ Posgrado guardado");
          this.mostrarPosgrado = false;
          this.resetForm();
        },
        error: () => this.mostrarMensaje("❌ Error al guardar posgrado")
      });
  }

  // ================= VER DETALLE =================
  verDetalle(item: any) {
    this.posgradoSeleccionado = { ...item };
  }

  // ================= ACTUALIZAR =================
  actualizarPosgrado() {

    this.http.put(
      `http://localhost:8181/egresado/posgrado/${this.posgradoSeleccionado.id}`,
      this.posgradoSeleccionado
    ).subscribe({
      next: () => {

        const index = this.historial.findIndex(p => p.id === this.posgradoSeleccionado.id);

        if (index !== -1) {
          this.historial[index] = { ...this.posgradoSeleccionado };
        }

        this.mostrarMensaje("✓ Posgrado actualizado");
        this.posgradoSeleccionado = null;
      },
      error: () => this.mostrarMensaje("❌ Error al actualizar")
    });
  }

  // ================= CANCELAR EDICIÓN =================
  cancelarEdicion() {
    this.posgradoSeleccionado = null;
  }

  // ================= RESET =================
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

  // ================= MENSAJE =================
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }

  // ===== ELIMINAR POSGRADO =====
eliminar(id: number) {
  this.historial = this.historial.filter(p => p.id !== id);
}
}