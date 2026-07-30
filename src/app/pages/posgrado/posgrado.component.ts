import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosgradoService } from '../../services/posgrado.service';
import { fechaHoyLocal } from '../../utils/fecha-hoy.util';

@Component({
  selector: 'app-posgrado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posgrado.component.html',
  styleUrls: ['./posgrado.component.css']
})
export class PosgradoComponent implements OnInit {

  constructor(private posgradoService: PosgradoService) {}

  matriculaUsuario: string = '';

  menuOculto = false;
  mostrarPopup = false;
  mostrarPosgrado = false;
  mostrarConfirmacion = false;
  mensaje = '';

  historial: any[] = [];
  posgradoSeleccionado: any = null;
  posgradoAEliminar: number | null = null;

  listaBecas: any[] = [];
  mostrarOtro = false;
  mostrarOtroEdit = false;
  otroTexto = '';

  /** Catálogo sin la fila "Otros" de BD; "Otro" solo abre el input personalizado */
  get listaBecasCatalogo(): any[] {
    return this.listaBecas.filter(b => !this.esOtroCatalogo(b.nombre));
  }

  private esOtroCatalogo(nombre: string): boolean {
    return /^(otros?)$/i.test((nombre || '').trim());
  }

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
    becasSeleccionadas: [] as any[]
  };

  ngOnInit() {
    const raw = sessionStorage.getItem('usuario');

    if (!raw) {
      this.mostrarMensaje('❌ No hay sesión activa');
      return;
    }

    const usuario = JSON.parse(raw);
    this.matriculaUsuario = usuario.matricula;

    this.cargarHistorial();
    this.cargarBecas();
  }

  cargarHistorial() {
    this.posgradoService.getPorMatricula(this.matriculaUsuario).subscribe({
      next: data => this.historial = (data || []).reverse(),
      error: () => this.mostrarMensaje('❌ Error al cargar historial')
    });
  }

  cargarBecas() {
    this.posgradoService.getTiposBeca().subscribe({
      next: data => this.listaBecas = data || [],
      error: () => this.mostrarMensaje('❌ Error al cargar becas')
    });
  }

  abrirFormulario() {
    this.mostrarPosgrado = true;
    this.posgradoSeleccionado = null;
    this.resetForm();
  }

  cancelar() {
    this.mostrarPosgrado = false;
    this.resetForm();
  }

  resetForm() {
    const hoy = fechaHoyLocal();
    this.form = {
      nivel: '',
      institucion: '',
      programa: '',
      modalidad: '',
      estatus: '',
      relacion: '',
      inicio: hoy,
      fin: '',
      tieneBeca: null,
      becasSeleccionadas: []
    };
    this.mostrarOtro = false;
    this.otroTexto = '';
  }

  onBecaChange() {
    if (!this.form.tieneBeca) {
      this.form.becasSeleccionadas = [];
      this.mostrarOtro = false;
      this.otroTexto = '';
    }
  }

  private normalizarTiposBeca(item: any): any[] {
    if (item?.tiposBeca?.length) {
      return [...item.tiposBeca];
    }
    if (item?.tipoBeca) {
      return [item.tipoBeca];
    }
    return [];
  }

  construirDatosPosgrado(base: any, becas: any[], tieneBeca: boolean) {
    const finRaw = base.fechaFin ?? base.fin ?? '';
    const fechaFin =
      typeof finRaw === 'string' && finRaw.trim() ? finRaw.trim() : null;

    return {
      ...base,
      fechaFin,
      tieneBeca,
      tiposBeca: tieneBeca
        ? becas.map((b: any) => ({ idTipoBeca: b.idTipoBeca }))
        : []
    };
  }

  private mensajeErrorHttp(err: any, fallback: string): string {
    const body = err?.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body?.message) {
      return body.message;
    }
    return fallback;
  }

  private validarFormularioAlta(): string | null {
    const f = this.form;
    if (!f.nivel || !f.institucion || !f.programa || !f.modalidad || !f.estatus || !f.relacion) {
      return '⚠️ Completa todos los campos obligatorios';
    }
    if (!f.inicio) {
      return '⚠️ Indica la fecha de inicio';
    }
    if (f.tieneBeca === null || f.tieneBeca === undefined) {
      return '⚠️ Indica si tienes beca';
    }
    if (f.tieneBeca && f.becasSeleccionadas.length === 0) {
      return '⚠️ Selecciona al menos un tipo de beca';
    }
    if (this.mostrarOtro && this.otroTexto.trim()) {
      return '⚠️ Pulsa + para agregar la beca escrita antes de guardar';
    }
    return null;
  }

  private validarFormularioEdicion(): string | null {
    const p = this.posgradoSeleccionado;
    if (!p?.nivelEstudio || !p?.institucion || !p?.nombrePrograma || !p?.modalidad || !p?.estatus || !p?.relacionadoCarrera) {
      return '⚠️ Completa todos los campos obligatorios';
    }
    if (!p?.fechaInicio) {
      return '⚠️ Indica la fecha de inicio';
    }
    if (p.tieneBeca === null || p.tieneBeca === undefined) {
      return '⚠️ Indica si tienes beca';
    }
    if (p.tieneBeca && !p.tiposBeca?.length) {
      return '⚠️ Selecciona al menos un tipo de beca';
    }
    if (this.mostrarOtroEdit && this.otroTexto.trim()) {
      return '⚠️ Pulsa + para agregar la beca escrita antes de guardar';
    }
    return null;
  }

  guardar(form: any) {
    const error = this.validarFormularioAlta();
    if (error) {
      if (form?.controls) {
        Object.values(form.controls).forEach((c: any) => c.markAsTouched?.());
      }
      this.mostrarMensaje(error);
      return;
    }

    const datos = this.construirDatosPosgrado({
      matricula: this.matriculaUsuario,
      nivelEstudio: this.form.nivel,
      institucion: this.form.institucion,
      nombrePrograma: this.form.programa,
      modalidad: this.form.modalidad,
      estatus: this.form.estatus,
      relacionadoCarrera: this.form.relacion,
      fechaInicio: this.form.inicio,
      fin: this.form.fin
    }, this.form.becasSeleccionadas, this.form.tieneBeca);

    this.posgradoService.guardar(datos).subscribe({
      next: () => {
        this.cargarHistorial();
        this.cargarBecas();
        this.mostrarMensaje('✓ Posgrado guardado');
        this.mostrarPosgrado = false;
        this.resetForm();
      },
      error: (err) => {
        console.error('ERROR BACKEND:', err.error);
        this.mostrarMensaje('❌ ' + this.mensajeErrorHttp(err, 'Error al guardar posgrado'));
      }
    });
  }

  verDetalle(item: any) {
    this.posgradoSeleccionado = { ...item };
    this.posgradoSeleccionado.tiposBeca = this.normalizarTiposBeca(item).filter(
      (b: any) => !this.esOtroCatalogo(b.nombre)
    );
    this.mostrarOtroEdit = false;
    this.otroTexto = '';
    this.mostrarPosgrado = false;
  }

  cancelarEdicion() {
    this.posgradoSeleccionado = null;
    this.mostrarOtroEdit = false;
    this.otroTexto = '';
  }

  actualizarPosgrado(formEdit: any) {
    const error = this.validarFormularioEdicion();
    if (error) {
      if (formEdit?.controls) {
        Object.values(formEdit.controls).forEach((c: any) => c.markAsTouched?.());
      }
      this.mostrarMensaje(error);
      return;
    }

    const datos = this.construirDatosPosgrado(
      this.posgradoSeleccionado,
      this.posgradoSeleccionado.tiposBeca || [],
      this.posgradoSeleccionado.tieneBeca
    );

    const id = this.posgradoSeleccionado.idPosgrado;
    this.posgradoService.actualizar(id, datos).subscribe({
      next: () => {
        this.cargarHistorial();
        this.cargarBecas();
        this.mostrarMensaje('✓ Posgrado actualizado');
        this.posgradoSeleccionado = null;
      },
      error: (err) => {
        console.error('ERROR BACKEND:', err.error);
        this.mostrarMensaje('❌ ' + this.mensajeErrorHttp(err, 'Error al actualizar'));
      }
    });
  }

  // ================= BECAS (FORM) =================
  toggleBecaById(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (!value) return;

    if (value === 'otro') {
      this.mostrarOtro = true;
    } else {
      const beca = this.listaBecas.find(b => b.idTipoBeca == value);

      if (beca && this.esOtroCatalogo(beca.nombre)) {
        this.mostrarOtro = true;
      } else {
        this.mostrarOtro = false;

        if (beca && !this.form.becasSeleccionadas.some(
          (b: any) => b.idTipoBeca === beca.idTipoBeca
        )) {
          this.form.becasSeleccionadas.push(beca);
        }

        this.otroTexto = '';
      }
    }

    select.value = '';
  }

  agregarOtraBeca() {
    if (!this.otroTexto.trim()) return;

    this.posgradoService.crearTipoBeca(this.otroTexto.trim()).subscribe({
      next: (resp) => {
        if (!this.listaBecas.some((b: any) => b.idTipoBeca === resp.idTipoBeca)) {
          this.listaBecas.push(resp);
        }
        if (!this.form.becasSeleccionadas.some((b: any) => b.idTipoBeca === resp.idTipoBeca)) {
          this.form.becasSeleccionadas.push(resp);
        }
        this.otroTexto = '';
        this.mostrarOtro = false;
        this.mostrarMensaje('✓ Beca agregada');
      },
      error: () => this.mostrarMensaje('❌ No se pudo agregar la beca')
    });
  }

  quitarBeca(beca: any) {
    this.form.becasSeleccionadas = this.form.becasSeleccionadas.filter(
      (b: any) => b.idTipoBeca !== beca.idTipoBeca
    );
  }

  get becasDisponiblesEdit() {
    if (!this.posgradoSeleccionado) return [];

    return this.listaBecasCatalogo.filter(b =>
      !this.posgradoSeleccionado.tiposBeca?.some(
        (sel: any) => sel.idTipoBeca === b.idTipoBeca
      )
    );
  }

  onSelectBecaEdit(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (!value) return;

    if (value === 'otro') {
      this.mostrarOtroEdit = true;
    } else {
      const beca = this.listaBecas.find(b => b.idTipoBeca == value);

      if (beca && this.esOtroCatalogo(beca.nombre)) {
        this.mostrarOtroEdit = true;
      } else {
        this.mostrarOtroEdit = false;

        if (!this.posgradoSeleccionado.tiposBeca) {
          this.posgradoSeleccionado.tiposBeca = [];
        }

        if (beca && !this.posgradoSeleccionado.tiposBeca.some(
          (b: any) => b.idTipoBeca === beca.idTipoBeca
        )) {
          this.posgradoSeleccionado.tiposBeca.push(beca);
        }

        this.otroTexto = '';
      }
    }

    select.value = '';
  }

  agregarBecaNuevaEdit() {
    if (!this.otroTexto.trim()) return;

    this.posgradoService.crearTipoBeca(this.otroTexto.trim()).subscribe({
      next: (resp) => {
        if (!this.posgradoSeleccionado.tiposBeca) {
          this.posgradoSeleccionado.tiposBeca = [];
        }
        if (!this.posgradoSeleccionado.tiposBeca.some(
          (b: any) => b.idTipoBeca === resp.idTipoBeca
        )) {
          this.posgradoSeleccionado.tiposBeca.push(resp);
        }
        if (!this.listaBecas.some((b: any) => b.idTipoBeca === resp.idTipoBeca)) {
          this.listaBecas.push(resp);
        }
        this.otroTexto = '';
        this.mostrarOtroEdit = false;
      },
      error: () => this.mostrarMensaje('❌ No se pudo agregar la beca')
    });
  }

  quitarBecaEdit(beca: any) {
    this.posgradoSeleccionado.tiposBeca = this.posgradoSeleccionado.tiposBeca.filter(
      (b: any) => b.idTipoBeca !== beca.idTipoBeca
    );
  }

  onBecaChangeEdit() {
    if (!this.posgradoSeleccionado.tieneBeca) {
      this.posgradoSeleccionado.tiposBeca = [];
      this.mostrarOtroEdit = false;
      this.otroTexto = '';
    }
  }

  abrirConfirmacion(id: number) {
    this.posgradoAEliminar = id;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminacion() {
    if (this.posgradoAEliminar !== null) {
      const id = this.posgradoAEliminar;
      this.posgradoService.eliminar(id).subscribe({
        next: () => {
          this.mostrarMensaje('🗑️ Posgrado eliminado correctamente');
          this.cargarHistorial();
          this.cerrarConfirmacion();
        },
        error: () => {
          this.mostrarMensaje('❌ Error al eliminar');
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

  mostrarConsulta = false;
  posgradoConsulta: any = null;

  abrirConsulta(pos: any) {
    this.posgradoConsulta = {
      ...pos,
      tiposBeca: this.normalizarTiposBeca(pos).filter(
        (b: any) => !this.esOtroCatalogo(b.nombre)
      )
    };
    this.mostrarConsulta = true;
  }

  cerrarConsulta() {
    this.mostrarConsulta = false;
    this.posgradoConsulta = null;
  }
}
