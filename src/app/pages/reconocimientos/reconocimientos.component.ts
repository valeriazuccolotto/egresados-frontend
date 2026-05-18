import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-reconocimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reconocimientos.component.html',
  styleUrls: ['./reconocimientos.component.css']
})
export class ReconocimientosComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) {}

matriculaUsuario: string = '';
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
  const raw = sessionStorage.getItem('usuario');

  if (!raw) {
    this.mostrarMensaje("❌ No hay sesión activa");
    return;
  }

  const usuario = JSON.parse(raw);
  this.matriculaUsuario = usuario.matricula;

  this.resetForm();
  this.cargarHistorial();
}

  // ================= HISTORIAL =================
  cargarHistorial() {
    this.http.get<any[]>(`/egresado/reconocimientos/${this.matriculaUsuario}`).pipe(
      catchError(() => this.http.get<any[]>(`/egresados/reconocimientos/${this.matriculaUsuario}`))
    ).subscribe({
      next: data => this.historial = data || [],
      error: () => this.mostrarMensaje("❌ Error al cargar historial")
    });
  }
  // ================= FORM =================
  resetForm() {
  this.form = {
    matricula: this.matriculaUsuario,
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

    this.http.post("/egresado/reconocimientos", datos).pipe(
      catchError(() => this.http.post("/egresados/reconocimientos", datos))
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

    const id = reco.idReconocimiento;
    this.http.put(`/egresado/reconocimientos/${id}`, reco).pipe(
      catchError(() => this.http.put(`/egresados/reconocimientos/${id}`, reco))
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
      const id = this.reconocimientoAEliminar;
      this.http.delete(`/egresado/reconocimientos/${id}`).pipe(
        catchError(() => this.http.delete(`/egresados/reconocimientos/${id}`))
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

mostrarConsulta = false;
recoConsulta: any = null;

abrirConsulta(reco: any) {
  this.recoConsulta = reco;
  this.mostrarConsulta = true;
}

cerrarConsulta() {
  this.mostrarConsulta = false;
  this.recoConsulta = null;
}
}
