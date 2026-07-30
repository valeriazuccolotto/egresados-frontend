import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReconocimientosService } from '../../services/reconocimientos.service';
import { fechaHoyLocal } from '../../utils/fecha-hoy.util';

@Component({
  selector: 'app-reconocimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reconocimientos.component.html',
  styleUrls: ['./reconocimientos.component.css']
})
export class ReconocimientosComponent implements OnInit {

  constructor(private reconocimientosService: ReconocimientosService) {}

  matriculaUsuario: string = '';
  // ================= UI =================
  mostrarFormulario = false;
  mensaje = '';

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
    this.reconocimientosService.getPorMatricula(this.matriculaUsuario).subscribe({
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
      recoFecha: fechaHoyLocal(),
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

    this.reconocimientosService.guardar(datos).subscribe({
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
    this.reconocimientosService.actualizar(id, reco).subscribe({
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
      this.reconocimientosService.eliminar(id).subscribe({
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
