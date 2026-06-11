import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BolsaTrabajo } from '../../models/bolsa-trabajo';
import { BolsaTrabajoService } from '../../services/bolsa-trabajo.service';

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

  constructor(private bolsaTrabajoService: BolsaTrabajoService) {}

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
    this.vacanteSeleccionada = this.vacanteSeleccionada === vacante ? null : vacante;
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

  private normalizarModalidad(modalidad: string): string {
    return modalidad
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
