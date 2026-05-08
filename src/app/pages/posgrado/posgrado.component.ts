import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';

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

  matriculaUsuario: string = '';

  // ===== UI =====
  menuOculto = false;
  mostrarPopup = false;
  mostrarPosgrado = false;
  mostrarConfirmacion = false;   // 🔥 modal confirmación
  mensaje = '';

  // ===== DATA =====
  historial: any[] = [];
  posgradoSeleccionado: any = null;
  posgradoAEliminar: number | null = null; // 🔥 id temporal para eliminar

  listaBecas: any[] = [];

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
    tieneBeca: null,
    idTipoBeca: null,
    otroBeca: ''
  };

  ngOnInit() {
  const raw = sessionStorage.getItem('usuario');

  if (!raw) {
    this.mostrarMensaje("❌ No hay sesión activa");
    return;
  }

  const usuario = JSON.parse(raw);
  this.matriculaUsuario = usuario.matricula;

  this.cargarHistorial();
  this.cargarBecas();
}

  cargarHistorial() {
  this.http.get<any[]>(`/egresado/posgrado/${this.matriculaUsuario}`)
    .subscribe({
      next: data => this.historial = data.reverse(),
      error: () => this.mostrarMensaje("❌ Error al cargar historial")
    });
}
  cargarBecas() {
    this.http.get<any[]>('/tipo-beca')
      .subscribe({
        next: data => {
          this.listaBecas = [...data, { idTipoBeca: 0, nombre: 'Otros' }];
        },
        error: () => this.mostrarMensaje("❌ Error al cargar becas")
      });
  }

  abrirFormulario() {
    this.mostrarPosgrado = true;
    this.posgradoSeleccionado = null;
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
      tieneBeca: null,
      idTipoBeca: null,
      otroBeca: ''
    };
  }

  onBecaChange() {
    if (!this.form.tieneBeca) {
      this.form.idTipoBeca = null;
      this.form.otroBeca = '';
    }
  }

  guardar(form: any) {
    if (form.invalid) {
      Object.values(form.controls).forEach((c: any) => c.markAsTouched());
      this.mostrarMensaje("⚠️ Completa todos los campos obligatorios");
      return;
    }

    const becaSeleccionada = this.listaBecas.find(b => b.idTipoBeca === this.form.idTipoBeca);

    const datos = {
  matricula: this.matriculaUsuario,
  nivelEstudio: this.form.nivel,
  institucion: this.form.institucion,
  nombrePrograma: this.form.programa,
  modalidad: this.form.modalidad,
  estatus: this.form.estatus,
  relacionadoCarrera: this.form.relacion,
  fechaInicio: this.form.inicio,
  fechaFin: this.form.fin,
  tieneBeca: this.form.tieneBeca,
  tipoBeca: this.form.tieneBeca && becaSeleccionada
    ? {
        nombre: this.form.idTipoBeca === 0
          ? this.form.otroBeca
          : becaSeleccionada.nombre
      }
    : null
};

    this.http.post('/egresado/posgrado', datos)
      .subscribe({
        next: () => {
          this.cargarHistorial();
          this.cargarBecas();
          this.mostrarMensaje("✓ Posgrado guardado");
          this.mostrarPosgrado = false;
          this.resetForm();
        },
        error: (err) => {
          console.error("ERROR BACKEND:", err.error);
          this.mostrarMensaje("❌ Error al guardar posgrado");
        }
      });
  }

  verDetalle(item: any) {
    this.posgradoSeleccionado = { ...item };

    if (this.posgradoSeleccionado.tieneBeca && this.posgradoSeleccionado.tipoBeca) {
      this.posgradoSeleccionado.idTipoBeca = this.posgradoSeleccionado.tipoBeca.idTipoBeca;

      const existe = this.listaBecas.find(b => b.nombre === this.posgradoSeleccionado.tipoBeca.nombre);
      if (!existe) {
        this.posgradoSeleccionado.idTipoBeca = 0;
        this.posgradoSeleccionado.otroBeca = this.posgradoSeleccionado.tipoBeca.nombre;
      }
    }
  }

  cancelarEdicion() {
    this.posgradoSeleccionado = null;
  }

  actualizarPosgrado(formEdit: any) {
    if (formEdit.invalid) {
      Object.values(formEdit.controls).forEach((c: any) => c.markAsTouched());
      this.mostrarMensaje("⚠️ Completa todos los campos");
      return;
    }

    const becaSeleccionada = this.listaBecas.find(b => b.idTipoBeca === this.posgradoSeleccionado.idTipoBeca);

    const datos = {
      ...this.posgradoSeleccionado,
      tipoBeca: this.posgradoSeleccionado.tieneBeca && becaSeleccionada
        ? {
            nombre: this.posgradoSeleccionado.idTipoBeca === 0
              ? this.posgradoSeleccionado.otroBeca
              : becaSeleccionada.nombre
          }
        : null
    };

    this.http.put(
      `/egresado/posgrado/${this.posgradoSeleccionado.idPosgrado}`,
      datos
    ).subscribe({
      next: () => {
        this.cargarHistorial();
        this.cargarBecas();
        this.mostrarMensaje("✓ Posgrado actualizado");
        this.posgradoSeleccionado = null;
      },
      error: () => this.mostrarMensaje("❌ Error al actualizar")
    });
  }

  // ================= ELIMINAR CON CONFIRMACIÓN =================
  abrirConfirmacion(id: number) {
    this.posgradoAEliminar = id;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminacion() {
    if (this.posgradoAEliminar !== null) {
      this.http.delete(`/egresado/posgrado/${this.posgradoAEliminar}`)
        .subscribe({
          next: () => {
            this.mostrarMensaje("🗑️ Posgrado eliminado correctamente");
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
    this.posgradoAEliminar = null;
  }

  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }

  // ================= CONSULTA =================
mostrarConsulta = false;
posgradoConsulta: any = null;

abrirConsulta(pos: any) {
  this.posgradoConsulta = pos;
  this.mostrarConsulta = true;
}

cerrarConsulta() {
  this.mostrarConsulta = false;
  this.posgradoConsulta = null;
}
}
