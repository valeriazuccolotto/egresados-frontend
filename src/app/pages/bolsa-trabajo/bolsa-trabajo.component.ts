import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BolsaTrabajo } from '../../models/bolsa-trabajo';
import { BolsaTrabajoService } from '../../services/bolsa-trabajo.service';
import { PostulacionBolsaTrabajoService } from '../../services/postulacion-bolsa-trabajo.service';
import { EstadisticasPostulacion, PostulacionVista } from '../../models/postulacion-bolsa-trabajo';

@Component({
  selector: 'app-bolsa-trabajo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './bolsa-trabajo.component.html',
  styleUrl: './bolsa-trabajo.component.css'
})
export class BolsaTrabajoComponent implements OnInit {

  vacantes: BolsaTrabajo[] = [];
  busqueda = '';
  modalidadFiltro = 'todas';
  cargando = false;
  mensajeError = '';
  vacanteSeleccionada: BolsaTrabajo | null = null;

  // E-22: postulantes y estadísticas por vacante
  postulantes: PostulacionVista[] = [];
  estadisticas: EstadisticasPostulacion | null = null;
  cargandoPostulantes = false;

  constructor(
    private bolsaTrabajoService: BolsaTrabajoService,
    private postulacionService: PostulacionBolsaTrabajoService
  ) {}

  ngOnInit(): void {
    this.cargarVacantes();
  }

  cargarVacantes(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.bolsaTrabajoService.getVacantes().subscribe({
      next: (data) => {
        this.vacantes = data || [];
        this.cargando = false;
      },
      error: () => {
        this.vacantes = [];
        this.cargando = false;
        this.mensajeError = 'Error al cargar las vacantes.';
      }
    });
  }

  get totalVacantes(): number {
    return this.vacantes.length;
  }

  get totalPresenciales(): number {
    return this.vacantes.filter(v => v.modalidad === 'Presencial').length;
  }

  get totalHibridas(): number {
    return this.vacantes.filter(v => v.modalidad === 'Hibrida').length;
  }

  get totalRemotas(): number {
    return this.vacantes.filter(v => v.modalidad === 'Remota').length;
  }

  get vacantesFiltradas(): BolsaTrabajo[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.vacantes.filter(vacante => {
      const carreras = this.nombresCarreras(vacante).toLowerCase();
      const empresa = this.nombreEmpresa(vacante).toLowerCase();
      const coincideTexto = !texto || (
        empresa.includes(texto) ||
        vacante.puesto.toLowerCase().includes(texto) ||
        vacante.descripcion.toLowerCase().includes(texto) ||
        carreras.includes(texto)
      );
      const coincideModalidad =
        this.modalidadFiltro === 'todas' ||
        vacante.modalidad === this.modalidadFiltro;

      return coincideTexto && coincideModalidad;
    });
  }

  setModalidad(filtro: string): void {
    this.modalidadFiltro = filtro;
  }

  toggleDetalle(vacante: BolsaTrabajo): void {
    if (this.vacanteSeleccionada === vacante) {
      this.vacanteSeleccionada = null;
      this.postulantes = [];
      this.estadisticas = null;
      return;
    }

    this.vacanteSeleccionada = vacante;
    this.cargarPostulantes(vacante);
  }

  esVacanteSeleccionada(vacante: BolsaTrabajo): boolean {
    return this.vacanteSeleccionada === vacante;
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
  // E-22: Postulantes / estadísticas
  // ═══════════════════════════════

  cargarPostulantes(vacante: BolsaTrabajo): void {
    this.cargandoPostulantes = true;
    this.postulantes = [];
    this.estadisticas = null;

    this.postulacionService.listarPorVacante(vacante.idBolsaTrabajo).subscribe({
      next: (data) => {
        this.postulantes = data || [];
        this.cargandoPostulantes = false;
      },
      error: () => {
        this.postulantes = [];
        this.cargandoPostulantes = false;
      }
    });

    this.postulacionService.obtenerEstadisticas(vacante.idBolsaTrabajo).subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: () => {
        this.estadisticas = null;
      }
    });
  }

  nombreCompletoPostulante(postulante: PostulacionVista): string {
    return [postulante.nombre, postulante.apellidoPaterno, postulante.apellidoMaterno]
      .filter(Boolean)
      .join(' ');
  }

  private normalizarModalidad(modalidad: string): string {
    return modalidad
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}