import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reconocimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reconocimientos.component.html',
  styleUrls: ['./reconocimientos.component.css']
})
export class ReconocimientosComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) {}

  usuario = 'Valeria';

  // ================= UI =================
  mostrarFormulario = false;
  mensaje = '';
  menuOculto = false;
  mostrarPopup = false;
  imagenPerfil: string | null = null;

  // ================= HISTORIAL =================
  historial: any[] = [];
  reconocimientoSeleccionado: any = null;

  // ================= CONFIRMACIÓN ELIMINAR =================
  mostrarConfirmacion = false;
  reconocimientoAEliminar: number | null = null;

  // ================= FORM =================
  form: any = {};

  ngOnInit() {
    this.resetForm();
    this.cargarHistorial();
  }

  // ================= HISTORIAL =================
  cargarHistorial() {
    this.http.get<any[]>(
      `http://localhost:8181/egresado/reconocimientos/A1234567`
    ).subscribe({
      next: data => this.historial = data,
      error: () => this.mostrarMensaje("❌ Error al cargar historial")
    });
  }

  // ================= FORM =================
  resetForm() {
    this.form = {
      matricula: "A1234567",
      recoNombre: '',
      recoTipo: '',
      recoFecha: '',
      recoInstitucion: ''
    };
  }

  nuevo() {
    this.mostrarFormulario = true;
    this.resetForm();
    this.reconocimientoSeleccionado = null;
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.resetForm();
  }

  construirDatos() {
    return {
      matricula: this.form.matricula,
      nombreReconocimiento: this.form.recoNombre,
      tipoReconocimiento: this.form.recoTipo,
      fechaEntrega: this.form.recoFecha,
      institucion: this.form.recoInstitucion
    };
  }

  // ================= GUARDAR =================
  guardar() {
    const datos = this.construirDatos();

    this.http.post(
      "http://localhost:8181/egresado/reconocimientos",
      datos
    ).subscribe({
      next: () => {
        this.mostrarMensaje("✓ Guardado correctamente");
        this.mostrarFormulario = false;
        this.resetForm();
        this.cargarHistorial();
      },
      error: () => this.mostrarMensaje("❌ Error al guardar")
    });
  }

  // ================= DETALLE =================
  verDetalle(reco: any) {
    this.reconocimientoSeleccionado = { ...reco };
    this.mostrarFormulario = false;
  }

  cancelarEdicion() {
    this.reconocimientoSeleccionado = null;
  }

  actualizarReconocimiento() {
    const reco = this.reconocimientoSeleccionado;

    this.http.put(
      `http://localhost:8181/egresado/reconocimientos/${reco.idReconocimiento}`,
      reco
    ).subscribe({
      next: () => {
        this.mostrarMensaje("✓ Registro actualizado");
        this.reconocimientoSeleccionado = null;
        this.cargarHistorial();
      },
      error: () => this.mostrarMensaje("❌ Error al actualizar")
    });
  }

  // ================= ELIMINAR CON CONFIRMACIÓN =================
  abrirConfirmacion(id: number) {
    this.reconocimientoAEliminar = id;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminacion() {
    if (this.reconocimientoAEliminar !== null) {
      this.http.delete(
        `http://localhost:8181/egresado/reconocimientos/${this.reconocimientoAEliminar}`
      ).subscribe({
        next: () => {
          this.mostrarMensaje("🗑️ Reconocimiento eliminado correctamente");
          this.cargarHistorial();
          this.cerrarConfirmacion();
        },
        error: () => {
          this.mostrarMensaje("❌ Error al eliminar");
          this.cerrarConfirmacion();
        }
      });
    }
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.reconocimientoAEliminar = null;
  }

  // ================= UI EXTRA =================
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenPerfil = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }
}
