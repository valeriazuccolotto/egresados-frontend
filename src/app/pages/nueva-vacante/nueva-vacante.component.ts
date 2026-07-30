import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Carrera } from '../../models/carrera';
import { BolsaTrabajoRequest } from '../../models/bolsa-trabajo';
import { BolsaTrabajoService } from '../../services/bolsa-trabajo.service';
import { CarreraService } from '../../services/carrera.service';

@Component({
  selector: 'app-nueva-vacante',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nueva-vacante.component.html',
  styleUrl: './nueva-vacante.component.css'
})
export class NuevaVacanteComponent implements OnInit {

  carreras: Carrera[] = [];
  carrerasSeleccionadas: string[] = [];
  mensajeExito = '';
  mensajeError = '';
  guardando = false;
  cargandoCarreras = false;
  cargandoVacante = false;
  modoEdicion = false;
  idVacante: number | null = null;

  vacante: BolsaTrabajoRequest = {
    matricula: '',
    nombreEmpresa: '',
    puesto: '',
    descripcion: '',
    salarioOfertado: null,
    modalidad: '',
    correoContacto: '',
    telefonoContacto: '',
    carreras: []
  };

  constructor(
    private bolsaTrabajoService: BolsaTrabajoService,
    private carreraService: CarreraService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.vacante.matricula = this.obtenerMatriculaAdmin();
    const id = this.route.snapshot.paramMap.get('id');
    this.modoEdicion = !!id;
    this.idVacante = id ? Number(id) : null;
    this.cargarCarreras();
    if (this.modoEdicion && this.idVacante) {
      this.cargarVacante(this.idVacante);
    }
  }

  cargarCarreras(): void {
    this.cargandoCarreras = true;

    this.carreraService.getCarreras().subscribe({
      next: (data) => {
        this.carreras = data || [];
        this.cargandoCarreras = false;
      },
      error: () => {
        this.carreras = [];
        this.cargandoCarreras = false;
        this.mensajeError = 'Error al cargar carreras.';
      }
    });
  }

  cargarVacante(id: number): void {
    this.cargandoVacante = true;
    this.bolsaTrabajoService.getVacante(id).subscribe({
      next: (data) => {
        this.vacante = {
          matricula: data.matricula || this.obtenerMatriculaAdmin(),
          nombreEmpresa: data.nombreEmpresa || '',
          puesto: data.puesto || '',
          descripcion: data.descripcion || '',
          salarioOfertado: data.salarioOfertado,
          modalidad: this.normalizarModalidadGuardado(data.modalidad),
          correoContacto: data.correoContacto || '',
          telefonoContacto: data.telefonoContacto || '',
          carreras: (data.carreras || []).map(c => ({ claveCarrera: c.claveCarrera }))
        };
        this.carrerasSeleccionadas = (data.carreras || []).map(c => c.claveCarrera);
        this.cargandoVacante = false;
      },
      error: () => {
        this.cargandoVacante = false;
        this.mensajeError = 'No se pudo cargar la vacante.';
      }
    });
  }

  toggleCarrera(claveCarrera: string): void {
    const idx = this.carrerasSeleccionadas.indexOf(claveCarrera);

    if (idx === -1) {
      this.carrerasSeleccionadas.push(claveCarrera);
    } else {
      this.carrerasSeleccionadas.splice(idx, 1);
    }

    this.vacante.carreras = this.carrerasSeleccionadas.map(clave => ({ claveCarrera: clave }));
  }

  isCarreraSeleccionada(claveCarrera: string): boolean {
    return this.carrerasSeleccionadas.includes(claveCarrera);
  }

  get labelCarrerasSeleccionadas(): string {
    if (this.carrerasSeleccionadas.length === 0) return 'Selecciona una o mas carreras';
    if (this.carrerasSeleccionadas.length === 1) {
      const carrera = this.carreras.find(c => c.claveCarrera === this.carrerasSeleccionadas[0]);
      return carrera?.nombreCarrera || '1 carrera seleccionada';
    }
    return `${this.carrerasSeleccionadas.length} carreras seleccionadas`;
  }

  guardar(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.validarFormulario()) {
      return;
    }

    this.guardando = true;
    this.vacante.modalidad = this.normalizarModalidadGuardado(this.vacante.modalidad);
    this.vacante.carreras = this.carrerasSeleccionadas.map(claveCarrera => ({ claveCarrera }));

    const peticion = this.modoEdicion && this.idVacante
      ? this.bolsaTrabajoService.actualizarVacante(this.idVacante, this.vacante)
      : this.bolsaTrabajoService.crearVacante(this.vacante);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = this.modoEdicion
          ? 'Vacante actualizada correctamente.'
          : 'Vacante guardada correctamente.';
        setTimeout(() => this.router.navigate(['/admin/bolsaTrabajo']), 900);
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = this.modoEdicion
          ? 'Error al actualizar la vacante.'
          : 'Error al guardar la vacante.';
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.vacante.matricula.trim()) {
      this.mensajeError = 'La matricula es obligatoria.';
      return false;
    }

    if (!this.vacante.nombreEmpresa.trim()) {
      this.mensajeError = 'La empresa es obligatoria.';
      return false;
    }

    if (!this.vacante.puesto.trim()) {
      this.mensajeError = 'El puesto es obligatorio.';
      return false;
    }

    if (!this.vacante.descripcion.trim()) {
      this.mensajeError = 'La descripcion es obligatoria.';
      return false;
    }

    if (this.vacante.salarioOfertado === null || this.vacante.salarioOfertado < 0) {
      this.mensajeError = 'El salario es obligatorio.';
      return false;
    }

    if (!['Presencial', 'Hibrida', 'Remota'].includes(this.vacante.modalidad)) {
      this.mensajeError = 'Selecciona una modalidad válida (Presencial, Híbrida o Remota).';
      return false;
    }

    if (!this.vacante.correoContacto.trim()) {
      this.mensajeError = 'El correo es obligatorio.';
      return false;
    }

    if (!this.validarCorreo(this.vacante.correoContacto)) {
      this.mensajeError = 'El correo de contacto no tiene un formato valido.';
      return false;
    }

    if (!this.vacante.telefonoContacto.trim()) {
      this.mensajeError = 'El telefono es obligatorio.';
      return false;
    }

    if (!this.validarTelefono(this.vacante.telefonoContacto)) {
      this.mensajeError = 'El telefono de contacto debe tener exactamente 10 digitos.';
      return false;
    }

    if (this.carrerasSeleccionadas.length === 0) {
      this.mensajeError = 'Selecciona al menos una carrera.';
      return false;
    }

    return true;
  }

  private validarCorreo(correo: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  }

  private validarTelefono(telefono: string): boolean {
    return /^\d{10}$/.test(telefono.trim());
  }

  private normalizarModalidadGuardado(modalidad: string): string {
    const valor = (modalidad || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
    if (valor.startsWith('hibrid')) return 'Hibrida';
    if (valor.startsWith('remot')) return 'Remota';
    if (valor.startsWith('presenc')) return 'Presencial';
    return modalidad || '';
  }

  private obtenerMatriculaAdmin(): string {
    const raw = sessionStorage.getItem('usuario');

    if (!raw) {
      return 'ADMIN001';
    }

    try {
      const usuario = JSON.parse(raw);
      return String(usuario.matricula || usuario.username || usuario.usuario || 'ADMIN001');
    } catch {
      return 'ADMIN001';
    }
  }
}
