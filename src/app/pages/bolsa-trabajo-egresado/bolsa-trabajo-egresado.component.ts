import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcademicoService } from '../../services/academico.service';
import { BolsaTrabajoService } from '../../services/bolsa-trabajo.service';
import { PerfilService } from '../../services/perfil.service';
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
  busqueda = '';
  modalidadFiltro = 'todas';
  cargando = false;
  mensajeError = '';
  vacanteSeleccionada: BolsaTrabajo | null = null;

  constructor(
    private academicoService: AcademicoService,
    private bolsaTrabajoService: BolsaTrabajoService,
    private perfilService: PerfilService
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
    this.bolsaTrabajoService.getVacantes().subscribe({
      next: (vacantes) => {
        this.vacantes = (vacantes || []).filter(vacante => this.esVacanteParaCarrera(vacante));
        this.cargando = false;
      },
      error: () => {
        this.vacantes = [];
        this.cargando = false;
        this.mensajeError = 'Error al cargar las vacantes.';
      }
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
