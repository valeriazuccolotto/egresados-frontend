import { Component, OnInit } from '@angular/core';
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
export class PosgradoComponent implements OnInit {

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

  // ================= INIT =================
  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.http.get<any[]>(`http://localhost:8181/egresado/posgrado/A1234567`)
      .subscribe({
        next: data => this.historial = data,
        error: () => this.mostrarMensaje("❌ Error al cargar")
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

  // ================= FORMULARIO =================
  abrirFormulario() {
    this.mostrarPosgrado = true;
  }

  cancelar() {
    this.mostrarPosgrado = false;
    this.resetForm();
  }

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

  // ================= GUARDAR =================
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
          this.cargarHistorial(); // 🔥 igual que laboral
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

  cancelarEdicion() {
    this.posgradoSeleccionado = null;
  }

  // ================= ACTUALIZAR =================
  actualizarPosgrado() {

    if (!this.posgradoSeleccionado?.idPosgrado) {
      this.mostrarMensaje("❌ Error: ID no definido");
      return;
    }

    this.http.put(
      `http://localhost:8181/egresado/posgrado/${this.posgradoSeleccionado.idPosgrado}`,
      this.posgradoSeleccionado
    ).subscribe({
      next: () => {
        this.cargarHistorial(); // 🔥 igual que laboral
        this.mostrarMensaje("✓ Posgrado actualizado");
        this.posgradoSeleccionado = null;
      },
      error: () => this.mostrarMensaje("❌ Error al actualizar")
    });
  }

  // ================= ELIMINAR =================
  eliminar(id: number) {
    this.http.delete(`http://localhost:8181/egresado/posgrado/${id}`)
      .subscribe({
        next: () => {
          this.mostrarMensaje("✓ Eliminado correctamente");
          this.cargarHistorial();
        },
        error: () => this.mostrarMensaje("❌ Error al eliminar")
      });
  }

  // ================= MENSAJE =================
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }
}