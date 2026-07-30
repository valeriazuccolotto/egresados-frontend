import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcademicoService } from '../../services/academico.service';
import { BolsaTrabajoService } from '../../services/bolsa-trabajo.service';
import { PerfilService } from '../../services/perfil.service';
import { PostulacionBolsaTrabajoService } from '../../services/postulacion-bolsa-trabajo.service';
import { BolsaTrabajo } from '../../models/bolsa-trabajo';
import { Carrera } from '../../models/carrera';

@Component({
  selector: 'app-bolsa-trabajo-egresado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './bolsa-trabajo-egresado.component.html',
  styleUrl: './bolsa-trabajo-egresado.component.css'
})
export class BolsaTrabajoEgresadoComponent implements OnInit {

  vacantes: BolsaTrabajo[] = [];
  carrera = '';
  claveCarrera = '';
  matricula = '';
  busqueda = '';
  modalidadFiltro = 'todas';
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  vacanteSeleccionada: BolsaTrabajo | null = null;

  // Estado de postulación por vacante: { [idBolsaTrabajo]: 'Sin aplicar' | 'Aplicado' | 'Contratado' }
  estadosPostulacion: { [idBolsaTrabajo: number]: string } = {};
  procesando: { [idBolsaTrabajo: number]: boolean } = {};

  constructor(
    private academicoService: AcademicoService,
    private bolsaTrabajoService: BolsaTrabajoService,
    private perfilService: PerfilService,
    private postulacionService: PostulacionBolsaTrabajoService
  ) {}

  ngOnInit(): void {
    this.cargarCarreraEgresado();
  }

  cargarCarreraEgresado(): void {
    const matricula = this.perfilService.obtenerMatriculaSesion();

    if (!matricula) {
      this.mensajeError = 'No hay sesion activa.';
      return;
    }

    this.matricula = matricula;
    this.cargando = true;
    this.academicoService.obtenerPorMatricula(matricula).subscribe({
      next: (academico: any) => {
        this.academicoService.obtenerCarreras().subscribe({
          next: (carreras: Carrera[]) => {
            const claveAcademico =
              academico?.claveCarrera ||
              academico?.carrera?.claveCarrera ||
              academico?.carrera;
            const carreraEncontrada = carreras.find(c => c.claveCarrera === claveAcademico);

            this.claveCarrera = String(carreraEncontrada?.claveCarrera || claveAcademico || '');
            this.carrera =
              carreraEncontrada?.nombreCarrera ||
              academico?.nombreCarrera ||
              academico?.carrera?.nombreCarrera ||
              '';
            this.cargarVacantes();
          },
          error: () => {
            this.cargando = false;
            this.mensajeError = 'Error al cargar la carrera del egresado.';
          }
        });
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'Error al cargar la informacion academica.';
      }
    });
  }

  cargarVacantes(): void {
    this.bolsaTrabajoService.getVacantesActivas().subscribe({
      next: (vacantes) => {
        this.vacantes = (vacantes || []).filter(vacante => this.esVacanteParaCarrera(vacante));
        this.cargando = false;
        this.cargarEstadosPostulacion();
      },
      error: () => {
        this.vacantes = [];
        this.cargando = false;
        this.mensajeError = 'Error al cargar las vacantes.';
      }
    });
  }

  cargarEstadosPostulacion(): void {
    if (!this.matricula) {
      return;
    }
    this.vacantes.forEach(vacante => {
      this.postulacionService.obtenerPostulacion(vacante.idBolsaTrabajo, this.matricula).subscribe({
        next: (res) => {
          this.estadosPostulacion[vacante.idBolsaTrabajo] = res?.estado || 'Sin aplicar';
        },
        error: () => {
          this.estadosPostulacion[vacante.idBolsaTrabajo] = 'Sin aplicar';
        }
      });
    });
  }

  get vacantesFiltradas(): BolsaTrabajo[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.vacantes.filter(vacante => {
      const coincideTexto = !texto || (
        this.nombreEmpresa(vacante).toLowerCase().includes(texto) ||
        vacante.puesto.toLowerCase().includes(texto) ||
        vacante.descripcion.toLowerCase().includes(texto)
      );
      const coincideModalidad =
        this.modalidadFiltro === 'todas' ||
        this.esModalidad(vacante, this.modalidadFiltro);

      return coincideTexto && coincideModalidad;
    });
  }

  setModalidad(filtro: string): void {
    this.modalidadFiltro = filtro;
  }

  abrirDetalle(vacante: BolsaTrabajo): void {
    this.vacanteSeleccionada = vacante;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cerrarDetalle(): void {
    this.vacanteSeleccionada = null;
  }

  nombreEmpresa(vacante: BolsaTrabajo): string {
    return vacante.nombreEmpresa;
  }

  salario(vacante: BolsaTrabajo): number | null {
    return vacante.salarioOfertado;
  }

  correoContacto(vacante: BolsaTrabajo): string {
    return vacante.correoContacto;
  }

  telefonoContacto(vacante: BolsaTrabajo): string {
    return vacante.telefonoContacto;
  }

  modalidadLabel(vacante: BolsaTrabajo): string {
    return this.normalizarModalidad(vacante.modalidad) === 'hibrida'
      ? 'Híbrida'
      : vacante.modalidad;
  }

  esModalidad(vacante: BolsaTrabajo, modalidad: string): boolean {
    return this.normalizarModalidad(vacante.modalidad) === this.normalizarModalidad(modalidad);
  }

  nombresCarreras(vacante: BolsaTrabajo): string {
    return (vacante.carreras || [])
      .map(carrera => carrera.nombreCarrera || carrera.claveCarrera)
      .filter(Boolean)
      .join(', ');
  }

  // ═══════════════════════════════
  // E-20 / E-21: Postulaciones
  // ═══════════════════════════════

  estadoPostulacion(vacante: BolsaTrabajo): string {
    return this.estadosPostulacion[vacante.idBolsaTrabajo] || 'Sin aplicar';
  }

  puedeAplicar(vacante: BolsaTrabajo): boolean {
    return this.estadoPostulacion(vacante) === 'Sin aplicar';
  }

  puedeMarcarContratado(vacante: BolsaTrabajo): boolean {
    return this.estadoPostulacion(vacante) === 'Aplicado';
  }

  yaFueContratado(vacante: BolsaTrabajo): boolean {
    return this.estadoPostulacion(vacante) === 'Contratado';
  }

  aplicarVacante(vacante: BolsaTrabajo): void {
    if (!this.matricula || this.procesando[vacante.idBolsaTrabajo]) {
      return;
    }
    this.procesando[vacante.idBolsaTrabajo] = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.postulacionService.aplicar(vacante.idBolsaTrabajo, this.matricula).subscribe({
      next: () => {
        this.estadosPostulacion[vacante.idBolsaTrabajo] = 'Aplicado';
        this.mensajeExito = 'Has aplicado a esta vacante correctamente.';
        this.procesando[vacante.idBolsaTrabajo] = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo registrar tu aplicación. Intenta de nuevo.';
        this.procesando[vacante.idBolsaTrabajo] = false;
      }
    });
  }

  marcarComoContratado(vacante: BolsaTrabajo): void {
    if (!this.matricula || this.procesando[vacante.idBolsaTrabajo]) {
      return;
    }

    const confirmacion = confirm(
      'Al marcar esta vacante como "Contratado" se agregará automáticamente un nuevo registro ' +
      'en tu información laboral con los datos de esta empresa. ¿Deseas continuar?'
    );
    if (!confirmacion) {
      return;
    }

    this.procesando[vacante.idBolsaTrabajo] = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.postulacionService.marcarContratado(vacante.idBolsaTrabajo, this.matricula).subscribe({
      next: () => {
        this.estadosPostulacion[vacante.idBolsaTrabajo] = 'Contratado';
        this.mensajeExito = '¡Felicidades! Se actualizó tu información laboral con los datos de esta vacante.';
        this.procesando[vacante.idBolsaTrabajo] = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo actualizar tu información laboral. Intenta de nuevo.';
        this.procesando[vacante.idBolsaTrabajo] = false;
      }
    });
  }

  private esVacanteParaCarrera(vacante: BolsaTrabajo): boolean {
    return (vacante.carreras || []).some(carrera =>
      carrera.claveCarrera === this.claveCarrera ||
      carrera.nombreCarrera === this.carrera
    );
  }

  private normalizarModalidad(modalidad: string): string {
    return modalidad
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}