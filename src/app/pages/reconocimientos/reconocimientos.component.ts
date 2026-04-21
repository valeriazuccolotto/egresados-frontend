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

  // ================= PERFIL =================
  mostrarPopup = false;
  imagenPerfil: string | null = null;

  // ================= HISTORIAL =================
  historial: any[] = [];
  reconocimientoSeleccionado: any = null;

  // ================= FORM =================
  form: any = {};

  // ================= INIT =================
  ngOnInit() {
    this.resetForm();
    this.cargarHistorial();
  }

  // ================= HISTORIAL =================
  cargarHistorial() {
    this.http.get<any[]>(
      `http://localhost:8181/egresado/reconocimientos/A1234567`
    ).subscribe(data => this.historial = data);
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

  // ================= DETALLE (ACORDEÓN) =================
  verDetalle(reco: any) {
    this.reconocimientoSeleccionado = { ...reco };
  }

  cerrarDetalle() {
    this.reconocimientoSeleccionado = null;
  }

  cancelarEdicion() {
    this.reconocimientoSeleccionado = null;
  }

  // ================= ACTUALIZAR =================
  actualizarReconocimiento() {
    const reco = this.reconocimientoSeleccionado;

    this.http.put(
      `http://localhost:8181/egresado/reconocimientos/${reco.idReconocimiento}`,
      reco
    ).subscribe({
      next: () => {
        const index = this.historial.findIndex(
          r => r.idReconocimiento === reco.idReconocimiento
        );

        if (index !== -1) {
          this.historial[index] = { ...reco };
        }

        this.mostrarMensaje("✓ Registro actualizado");
        this.cerrarDetalle();
      },
      error: () => this.mostrarMensaje("❌ Error al actualizar")
    });
  }

  // ================= ELIMINAR =================
  eliminarReconocimiento(id: number) {
    this.http.delete(
      `http://localhost:8181/egresado/reconocimientos/${id}`
    ).subscribe({
      next: () => {
        this.mostrarMensaje("✓ Eliminado correctamente");
        this.cargarHistorial();
      },
      error: () => this.mostrarMensaje("❌ Error al eliminar")
    });
  }

  // ================= UI =================
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

  // ================= CANCELAR FORM NUEVO =================
  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.resetForm();
  }
}