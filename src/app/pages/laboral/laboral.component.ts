import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { ESTADOS_REPUBLICA_MEXICANA } from '../../utils/estados-mexico.util';
import { repararTextoEnObjeto } from '../../utils/texto-encoding.util';

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
  municipiosOaxaca: string[] = [];
  cargandoMunicipios = false;
  form: any = {};
  readonly estadosRepublica = [...ESTADOS_REPUBLICA_MEXICANA];
  readonly estadoOaxaca = 'Oaxaca';
  readonly estadoExtranjero = 'Extranjero';
  estadoDropdownAbierto: 'create' | 'edit' | null = null;
  municipioDropdownAbierto: 'create' | 'edit' | null = null;
  municipioBusquedaCreate = '';
  municipioBusquedaEdit = '';
  estadoTrabajoTouchedCreate = false;
  estadoTrabajoTouchedEdit = false;
  municipioTouchedCreate = false;
  municipioTouchedEdit = false;
  lugarExtranjeroTouchedCreate = false;
  lugarExtranjeroTouchedEdit = false;

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
  this.cargarMunicipiosOaxaca();
}
  // ================= HISTORIAL =================
  cargarHistorial() {
    this.http.get<any[]>(`/egresado/laboral/${this.matriculaUsuario}`).pipe(
      catchError(() => this.http.get<any[]>(`/egresados/laboral/${this.matriculaUsuario}`))
    ).subscribe({
      next: data => {
        this.historial = (data || [])
          .map(item => repararTextoEnObjeto(item))
          .reverse();
      },
      error: () => this.mostrarMensaje("❌ Error al cargar historial")
    });
  }

  // ================= CATALOGO =================
  cargarPrestacionesCatalogo() {
    this.http.get<any[]>(`/egresado/prestaciones`).pipe(
      catchError(() => this.http.get<any[]>(`/egresados/prestaciones`))
    ).subscribe({
      next: data => {
        this.listaPrestaciones = (data || []).map(item => repararTextoEnObjeto(item));
      },
      error: () => this.mostrarMensaje("❌ Error al cargar catálogo")
    });
  }

  cargarMunicipiosOaxaca() {
    this.cargandoMunicipios = true;
    this.http.get<string[]>(`/egresado/catalogos/municipios-oaxaca`).pipe(
      catchError(() => this.http.get<string[]>(`/egresados/catalogos/municipios-oaxaca`)),
      catchError(() => this.http.get<string[]>(`/egresado/laboral/catalogo/municipios-oaxaca`)),
      catchError(() => this.http.get<string[]>(`/assets/catalogos/municipios-oaxaca.json`))
    ).subscribe({
      next: data => {
        this.municipiosOaxaca = (data || []).map(nombre => repararTextoEnObjeto(nombre));
        this.cargandoMunicipios = false;
      },
      error: () => {
        this.cargandoMunicipios = false;
        this.mostrarMensaje('❌ No se pudieron cargar los municipios de Oaxaca');
      }
    });
  }

  get municipiosFiltradosCreate(): string[] {
    return this.filtrarMunicipios(this.municipioBusquedaCreate);
  }

  get municipiosFiltradosEdit(): string[] {
    return this.filtrarMunicipios(this.municipioBusquedaEdit);
  }

  private filtrarMunicipios(busqueda: string): string[] {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) {
      return this.municipiosOaxaca;
    }
    return this.municipiosOaxaca.filter(municipio =>
      municipio.toLowerCase().includes(termino)
    );
  }

  // ================= FORM =================
  resetForm() {
  this.form = {
    matricula: this.matriculaUsuario,
    empresa: '',
    puesto: '',
    sector: '',
    estadoTrabajo: '',
    lugarExtranjero: '',
    municipioTrabajo: '',
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
    this.cerrarDropdownsUbicacion();
    if (!this.municipiosOaxaca.length && !this.cargandoMunicipios) {
      this.cargarMunicipiosOaxaca();
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.resetForm();
    this.cerrarDropdownsUbicacion();
  }

  toggleEstadoDropdown(modo: 'create' | 'edit', event?: Event) {
    event?.stopPropagation();
    this.estadoDropdownAbierto = this.estadoDropdownAbierto === modo ? null : modo;
    if (modo === 'create') {
      this.estadoTrabajoTouchedCreate = true;
    } else {
      this.estadoTrabajoTouchedEdit = true;
    }
  }

  seleccionarEstadoTrabajo(estado: string, modo: 'create' | 'edit', event?: Event) {
    event?.stopPropagation();
    if (modo === 'create') {
      this.form.estadoTrabajo = estado;
      this.estadoTrabajoTouchedCreate = true;
      this.limpiarUbicacionDetalle(this.form, estado);
    } else if (this.laboralSeleccionado) {
      this.laboralSeleccionado.estadoTrabajo = estado;
      this.estadoTrabajoTouchedEdit = true;
      this.limpiarUbicacionDetalle(this.laboralSeleccionado, estado);
    }
    this.cerrarEstadoDropdown();
    this.cerrarMunicipioDropdown();
  }

  toggleMunicipioDropdown(modo: 'create' | 'edit', event?: Event) {
    event?.stopPropagation();
    this.municipioDropdownAbierto = this.municipioDropdownAbierto === modo ? null : modo;
    if (modo === 'create') {
      this.municipioTouchedCreate = true;
      this.municipioBusquedaCreate = '';
    } else {
      this.municipioTouchedEdit = true;
      this.municipioBusquedaEdit = '';
    }
  }

  seleccionarMunicipio(municipio: string, modo: 'create' | 'edit', event?: Event) {
    event?.stopPropagation();
    if (modo === 'create') {
      this.form.municipioTrabajo = municipio;
      this.municipioTouchedCreate = true;
    } else if (this.laboralSeleccionado) {
      this.laboralSeleccionado.municipioTrabajo = municipio;
      this.municipioTouchedEdit = true;
    }
    this.cerrarMunicipioDropdown();
  }

  cerrarEstadoDropdown() {
    this.estadoDropdownAbierto = null;
  }

  cerrarMunicipioDropdown() {
    this.municipioDropdownAbierto = null;
    this.municipioBusquedaCreate = '';
    this.municipioBusquedaEdit = '';
  }

  cerrarDropdownsUbicacion() {
    this.cerrarEstadoDropdown();
    this.cerrarMunicipioDropdown();
  }

  private limpiarUbicacionDetalle(destino: any, estado: string) {
    if (estado !== this.estadoOaxaca) {
      destino.municipioTrabajo = '';
    }
    if (estado !== this.estadoExtranjero) {
      destino.lugarExtranjero = '';
    }
  }

  private normalizarUbicacionLaboral(item: any) {
    return {
      ...item,
      estadoTrabajo: item.estadoTrabajo ?? item.estado_trabajo ?? '',
      lugarExtranjero: item.lugarExtranjero ?? item.lugar_extranjero ?? '',
      municipioTrabajo: item.municipioTrabajo ?? item.municipio_trabajo ?? ''
    };
  }

  textoUbicacionLaboral(laboral: any): string {
    const estado = laboral?.estadoTrabajo ?? laboral?.estado_trabajo ?? '';
    if (!estado) {
      return '';
    }
    if (estado === this.estadoOaxaca) {
      const municipio = laboral?.municipioTrabajo ?? laboral?.municipio_trabajo;
      return municipio ? `${estado} — ${municipio}` : estado;
    }
    if (estado === this.estadoExtranjero) {
      const lugar = laboral?.lugarExtranjero ?? laboral?.lugar_extranjero;
      return lugar ? `${estado} — ${lugar}` : estado;
    }
    return estado;
  }

  private validarUbicacionLaboral(
    estadoTrabajo: string,
    lugarExtranjero: string,
    municipioTrabajo: string,
    modo: 'create' | 'edit'
  ): boolean {
    if (estadoTrabajo === this.estadoExtranjero) {
      if (modo === 'create') {
        this.lugarExtranjeroTouchedCreate = true;
      } else {
        this.lugarExtranjeroTouchedEdit = true;
      }
      if (!lugarExtranjero?.trim()) {
        this.mostrarMensaje('Indique en qué parte del extranjero trabaja.');
        return false;
      }
    }

    if (estadoTrabajo === this.estadoOaxaca) {
      if (modo === 'create') {
        this.municipioTouchedCreate = true;
      } else {
        this.municipioTouchedEdit = true;
      }
      if (!municipioTrabajo?.trim()) {
        this.mostrarMensaje('Seleccione el municipio de Oaxaca.');
        return false;
      }
    }

    return true;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.cerrarDropdownsUbicacion();
  }

  construirDatos() {
    return {
      matricula: this.form.matricula,
      empresa: this.form.empresa,
      puesto: this.form.puesto,
      sector: this.form.sector,
      estadoTrabajo: this.form.estadoTrabajo,
      lugarExtranjero: this.form.estadoTrabajo === this.estadoExtranjero
        ? this.form.lugarExtranjero?.trim()
        : null,
      municipioTrabajo: this.form.estadoTrabajo === this.estadoOaxaca
        ? this.form.municipioTrabajo?.trim()
        : null,
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
    this.estadoTrabajoTouchedCreate = true;
    if (!this.validarUbicacionLaboral(
      this.form.estadoTrabajo,
      this.form.lugarExtranjero,
      this.form.municipioTrabajo,
      'create'
    )) {
      return;
    }
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
    this.laboralSeleccionado = repararTextoEnObjeto(this.normalizarUbicacionLaboral(laboral));
    if (!this.laboralSeleccionado.prestaciones) {
      this.laboralSeleccionado.prestaciones = [];
    }
    this.mostrarFormulario = false;
    this.cerrarDropdownsUbicacion();
  }

  cancelarEdicion() {
    this.laboralSeleccionado = null;
    this.cerrarDropdownsUbicacion();
  }

  actualizarLaboral() {
    this.estadoTrabajoTouchedEdit = true;
    const laboral = this.laboralSeleccionado;
    if (!this.validarUbicacionLaboral(
      laboral.estadoTrabajo,
      laboral.lugarExtranjero,
      laboral.municipioTrabajo,
      'edit'
    )) {
      return;
    }

    const payload = {
      ...laboral,
      lugarExtranjero: laboral.estadoTrabajo === this.estadoExtranjero
        ? laboral.lugarExtranjero?.trim()
        : null,
      municipioTrabajo: laboral.estadoTrabajo === this.estadoOaxaca
        ? laboral.municipioTrabajo?.trim()
        : null
    };

    const id = laboral.idLaboral;
    this.http.put(`/egresado/laboral/${id}`, payload).pipe(
      catchError(() => this.http.put(`/egresados/laboral/${id}`, payload))
    ).subscribe({
      next: () => {
        const index = this.historial.findIndex(l => l.idLaboral === laboral.idLaboral);
        if (index !== -1) {
          this.historial[index] = { ...payload };
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
  this.laboralConsulta = repararTextoEnObjeto(this.normalizarUbicacionLaboral(laboral));
  this.mostrarConsulta = true;
}

cerrarConsulta() {
  this.mostrarConsulta = false;
  this.laboralConsulta = null;
}
}