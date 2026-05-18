import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-laboral',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './laboral.component.html',
  styleUrls: ['./laboral.component.css']
})
export class LaboralComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) {}

  matriculaUsuario: string = '';

  // ================= UI =================
  mostrarFormulario = false;
  mostrarOtro = false;
  mostrarOtroEdit = false;
  mensaje = '';
  menuOculto = false;
  mostrarPopup = false;
  imagenPerfil: string | null = null;
  otroTexto = '';

  // ================= HISTORIAL =================
  historial: any[] = [];
  laboralSeleccionado: any = null;

  // ================= CONFIRMACIÓN =================
  mostrarConfirmacion = false;
  laboralAEliminar: number | null = null;

  // ================= CONSULTA =================
  mostrarConsulta = false;
  laboralConsulta: any = null;

  // ================= FORM =================
  listaPrestaciones: any[] = [];
  form: any = {};

  // ================= INIT =================
  ngOnInit() {
  const raw = sessionStorage.getItem('usuario');

if (!raw) {
  this.mostrarMensaje('No hay sesión activa. Inicia sesión nuevamente.');
  return;
}

const usuario = JSON.parse(raw);
this.matriculaUsuario = usuario.matricula;

  this.resetForm();
  this.cargarHistorial();
  this.cargarPrestacionesCatalogo();
}
  // ================= HISTORIAL =================
  cargarHistorial() {
    this.http.get<any[]>(`/egresado/laboral/${this.matriculaUsuario}`).pipe(
      catchError(() => this.http.get<any[]>(`/egresados/laboral/${this.matriculaUsuario}`))
    ).subscribe({
      next: data => this.historial = (data || []).reverse(),
      error: () => this.mostrarMensaje("❌ Error al cargar historial")
    });
  }

  // ================= CATALOGO =================
  cargarPrestacionesCatalogo() {
    this.http.get<any[]>(`/egresado/prestaciones`).pipe(
      catchError(() => this.http.get<any[]>(`/egresados/prestaciones`))
    ).subscribe({
      next: data => this.listaPrestaciones = data || [],
      error: () => this.mostrarMensaje("❌ Error al cargar catálogo")
    });
  }

  // ================= FORM =================
  resetForm() {
  this.form = {
    matricula: this.matriculaUsuario,
    empresa: '',
    puesto: '',
    sector: '',
    medio: '',
    tiempo: '',
    contrato: '',
    modalidad: '',
    salario: '',
    prestacionesSeleccionadas: [],
    relacion: '',
    comentarios: ''
  };
}

  nuevoTrabajo() {
    this.mostrarFormulario = true;
    this.resetForm();
    this.laboralSeleccionado = null;
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.resetForm();
  }

  construirDatos() {
    return {
      matricula: this.form.matricula,
      empresa: this.form.empresa,
      puesto: this.form.puesto,
      sector: this.form.sector,
      comoConsiguio: this.form.medio,
      tiempoConseguir: this.form.tiempo,
      tipoContrato: this.form.contrato,
      modalidadTrabajo: this.form.modalidad,
      salario: this.form.salario,
      relacionCarrera: this.form.relacion,
      comentarios: this.form.comentarios,
      prestaciones: this.form.prestacionesSeleccionadas
    };
  }

  guardar() {
    const datos = this.construirDatos();
    this.http.post("/egresado/laboral", datos).pipe(
      catchError(() => this.http.post("/egresados/laboral", datos))
    ).subscribe({
      next: () => {
        this.mostrarMensaje("✓ Guardado correctamente");
        this.mostrarFormulario = false;
        this.cargarHistorial();
      },
      error: () => this.mostrarMensaje("❌ Error al guardar")
    });
  }

  // ================= DETALLE =================
  verDetalle(laboral: any) {
    this.laboralSeleccionado = { ...laboral };
    if (!this.laboralSeleccionado.prestaciones) {
      this.laboralSeleccionado.prestaciones = [];
    }
    this.mostrarFormulario = false;
  }

  cancelarEdicion() {
    this.laboralSeleccionado = null;
  }

  actualizarLaboral() {
    const laboral = this.laboralSeleccionado;
    const id = laboral.idLaboral;
    this.http.put(`/egresado/laboral/${id}`, laboral).pipe(
      catchError(() => this.http.put(`/egresados/laboral/${id}`, laboral))
    ).subscribe({
      next: () => {
        const index = this.historial.findIndex(l => l.idLaboral === laboral.idLaboral);
        if (index !== -1) {
          this.historial[index] = { ...laboral };
        }
        this.mostrarMensaje("✓ Registro actualizado");
        this.cancelarEdicion();
      },
      error: () => this.mostrarMensaje("❌ Error al actualizar")
    });
  }

  // ================= ELIMINAR =================
  abrirConfirmacion(id: number) {
    this.laboralAEliminar = id;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminacion() {
    if (this.laboralAEliminar !== null) {
      const id = this.laboralAEliminar;
      this.http.delete(`/egresado/laboral/${id}`).pipe(
        catchError(() => this.http.delete(`/egresados/laboral/${id}`))
      ).subscribe({
        next: () => {
          this.mostrarMensaje("🗑️ Eliminado correctamente");
          this.cargarHistorial();
          this.cerrarConfirmacion();
        },
        error: () => this.mostrarMensaje("❌ Error al eliminar")
      });
    }
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.laboralAEliminar = null;
  }

  // ================= PRESTACIONES (FORM) =================
  togglePrestacionById(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (!value) return;

    if (value === 'otro') {
      this.mostrarOtro = true;
    } else {
      this.mostrarOtro = false;

      const prestacion = this.listaPrestaciones.find(p => p.idPrestaciones == value);

      if (prestacion && !this.form.prestacionesSeleccionadas.some(
        (p: any) => p.idPrestaciones === prestacion.idPrestaciones
      )) {
        this.form.prestacionesSeleccionadas.push(prestacion);
      }

      this.otroTexto = '';
    }

    select.value = '';
  }

  agregarOtroPrestacion() {
  if (!this.otroTexto.trim()) return;

  this.http.post<any>("/egresado/prestaciones", { nombre: this.otroTexto }).pipe(
    catchError(() => this.http.post<any>("/egresados/prestaciones", { nombre: this.otroTexto }))
  ).subscribe({
    next: (resp) => {
      this.form.prestacionesSeleccionadas.push(resp);
      this.listaPrestaciones.push(resp);
      this.otroTexto = '';
      this.mostrarOtro = false;
    },
    error: () => this.mostrarMensaje("❌ No se pudo agregar la prestación")
  });
}

  quitarPrestacion(prestacion: any) {
    this.form.prestacionesSeleccionadas =
      this.form.prestacionesSeleccionadas.filter((p: any) => p.idPrestaciones !== prestacion.idPrestaciones);
  }

  // ================= PRESTACIONES (EDIT) =================
  get prestacionesDisponiblesEdit() {
    if (!this.listaPrestaciones || !this.laboralSeleccionado) return [];

    return this.listaPrestaciones.filter(p =>
      !this.laboralSeleccionado.prestaciones?.some(
        (sel: any) => sel.idPrestaciones === p.idPrestaciones
      )
    );
  }

  onSelectPrestacionEdit(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (!value) return;

    if (value === 'otro') {
      this.mostrarOtroEdit = true;
    } else {
      this.mostrarOtroEdit = false;

      const prestacion = this.listaPrestaciones.find(p => p.idPrestaciones == value);

      if (!this.laboralSeleccionado.prestaciones) {
        this.laboralSeleccionado.prestaciones = [];
      }

      if (prestacion && !this.laboralSeleccionado.prestaciones.some(
        (p: any) => p.idPrestaciones === prestacion.idPrestaciones
      )) {
        this.laboralSeleccionado.prestaciones.push(prestacion);
      }

      this.otroTexto = '';
    }

    select.value = '';
  }

  agregarPrestacionNuevaEdit() {
  if (!this.otroTexto.trim()) return;

  this.http.post<any>("/egresado/prestaciones", { nombre: this.otroTexto }).pipe(
    catchError(() => this.http.post<any>("/egresados/prestaciones", { nombre: this.otroTexto }))
  ).subscribe({
    next: (resp) => {
      if (!this.laboralSeleccionado.prestaciones) {
        this.laboralSeleccionado.prestaciones = [];
      }
      this.laboralSeleccionado.prestaciones.push(resp);
      this.listaPrestaciones.push(resp);
      this.otroTexto = '';
      this.mostrarOtroEdit = false;
    },
    error: () => this.mostrarMensaje("❌ No se pudo agregar la prestación")
  });
}

  quitarPrestacionEdit(prestacion: any) {
    this.laboralSeleccionado.prestaciones =
      this.laboralSeleccionado.prestaciones.filter(
        (p: any) => p.idPrestaciones !== prestacion.idPrestaciones
      );
  }

  // ================= UI EXTRA =================
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }

  abrirConsulta(laboral: any) {
  this.laboralConsulta = laboral;
  this.mostrarConsulta = true;
}

cerrarConsulta() {
  this.mostrarConsulta = false;
  this.laboralConsulta = null;
}
}