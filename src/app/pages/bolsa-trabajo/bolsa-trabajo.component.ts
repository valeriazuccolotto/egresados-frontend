import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BolsaTrabajo } from '../../models/bolsa-trabajo';
import { BolsaTrabajoService } from '../../services/bolsa-trabajo.service';
import { PostulacionBolsaTrabajoService } from '../../services/postulacion-bolsa-trabajo.service';
import { EstadisticasPostulacion, PostulacionVista } from '../../models/postulacion-bolsa-trabajo';
import { CarreraService } from '../../services/carrera.service';
import { Carrera } from '../../models/carrera';

@Component({
  selector: 'app-bolsa-trabajo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './bolsa-trabajo.component.html',
  styleUrl: './bolsa-trabajo.component.css'
})
export class BolsaTrabajoComponent implements OnInit {

  vacantes: BolsaTrabajo[] = [];
  carreras: Carrera[] = [];
  busqueda = '';
  modalidadFiltro = 'todas';
  estadoFiltro: 'todas' | 'activas' | 'inactivas' = 'activas';
  carreraFiltro = '';
  postulantesFiltro: 'todas' | 'con' | 'sin' = 'todas';
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  vacanteSeleccionada: BolsaTrabajo | null = null;
  procesandoId: number | null = null;
  procesandoMatricula: string | null = null;

  postulantes: PostulacionVista[] = [];
  estadisticas: EstadisticasPostulacion | null = null;
  cargandoPostulantes = false;
  conteoPostulantes: Record<number, number> = {};

  constructor(
    private bolsaTrabajoService: BolsaTrabajoService,
    private postulacionService: PostulacionBolsaTrabajoService,
    private carreraService: CarreraService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCarreras();
    this.cargarVacantes();
  }

  cargarCarreras(): void {
    this.carreraService.getCarreras().subscribe({
      next: data => this.carreras = data || [],
      error: () => this.carreras = []
    });
  }

  cargarVacantes(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.bolsaTrabajoService.getVacantes().subscribe({
      next: (data) => {
        this.vacantes = data || [];
        this.cargando = false;
        this.cargarConteosPostulantes();
        if (this.vacanteSeleccionada) {
          const actualizada = this.vacantes.find(
            v => v.idBolsaTrabajo === this.vacanteSeleccionada?.idBolsaTrabajo
          );
          if (actualizada) {
            this.vacanteSeleccionada = actualizada;
            this.cargarPostulantes(actualizada);
          } else {
            this.vacanteSeleccionada = null;
          }
        }
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

  get totalActivas(): number {
    return this.vacantes.filter(v => v.activo !== false).length;
  }

  get totalInactivas(): number {
    return this.vacantes.filter(v => v.activo === false).length;
  }

  get totalPresenciales(): number {
    return this.vacantes.filter(v => this.esModalidad(v, 'Presencial')).length;
  }

  get totalHibridas(): number {
    return this.vacantes.filter(v => this.esModalidad(v, 'Hibrida')).length;
  }

  get totalRemotas(): number {
    return this.vacantes.filter(v => this.esModalidad(v, 'Remota')).length;
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
        this.esModalidad(vacante, this.modalidadFiltro);

      const activa = vacante.activo !== false;
      const coincideEstado =
        this.estadoFiltro === 'todas' ||
        (this.estadoFiltro === 'activas' && activa) ||
        (this.estadoFiltro === 'inactivas' && !activa);

      const coincideCarrera = !this.carreraFiltro ||
        (vacante.carreras || []).some(c => c.claveCarrera === this.carreraFiltro);

      const total = this.conteoPostulantes[vacante.idBolsaTrabajo] ?? 0;
      const coincidePostulantes =
        this.postulantesFiltro === 'todas' ||
        (this.postulantesFiltro === 'con' && total > 0) ||
        (this.postulantesFiltro === 'sin' && total === 0);

      return coincideTexto && coincideModalidad && coincideEstado && coincideCarrera && coincidePostulantes;
    });
  }

  setModalidad(filtro: string): void {
    this.modalidadFiltro = filtro;
  }

  setEstado(filtro: 'todas' | 'activas' | 'inactivas'): void {
    this.estadoFiltro = filtro;
  }

  toggleDetalle(vacante: BolsaTrabajo): void {
    if (this.vacanteSeleccionada?.idBolsaTrabajo === vacante.idBolsaTrabajo) {
      this.vacanteSeleccionada = null;
      this.postulantes = [];
      this.estadisticas = null;
      return;
    }

    this.vacanteSeleccionada = vacante;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cargarPostulantes(vacante);
  }

  esVacanteSeleccionada(vacante: BolsaTrabajo): boolean {
    return this.vacanteSeleccionada?.idBolsaTrabajo === vacante.idBolsaTrabajo;
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
    const modalidad = this.normalizarModalidad(vacante.modalidad);
    if (modalidad === 'hibrida') return 'Híbrida';
    if (modalidad === 'remota') return 'Remota';
    if (modalidad === 'presencial') return 'Presencial';
    return vacante.modalidad;
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

  editarVacante(vacante: BolsaTrabajo, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['/admin/bolsaTrabajo/editar', vacante.idBolsaTrabajo]);
  }

  desactivarVacante(vacante: BolsaTrabajo, event?: Event): void {
    event?.stopPropagation();
    if (!confirm(`¿Desactivar la vacante "${vacante.puesto}" de ${vacante.nombreEmpresa}?`)) {
      return;
    }
    this.procesandoId = vacante.idBolsaTrabajo;
    this.bolsaTrabajoService.desactivarVacante(vacante.idBolsaTrabajo).subscribe({
      next: () => {
        this.procesandoId = null;
        this.mensajeExito = 'Vacante desactivada.';
        this.cargarVacantes();
      },
      error: () => {
        this.procesandoId = null;
        this.mensajeError = 'No se pudo desactivar la vacante.';
      }
    });
  }

  reactivarVacante(vacante: BolsaTrabajo, event?: Event): void {
    event?.stopPropagation();
    this.procesandoId = vacante.idBolsaTrabajo;
    this.bolsaTrabajoService.reactivarVacante(vacante.idBolsaTrabajo).subscribe({
      next: () => {
        this.procesandoId = null;
        this.mensajeExito = 'Vacante reactivada.';
        this.cargarVacantes();
      },
      error: () => {
        this.procesandoId = null;
        this.mensajeError = 'No se pudo reactivar la vacante.';
      }
    });
  }

  marcarContratado(postulante: PostulacionVista, vacante: BolsaTrabajo): void {
    if (postulante.estado === 'Contratado') return;
    if (!confirm(`¿Marcar a ${this.nombreCompletoPostulante(postulante)} como contratado?`)) {
      return;
    }
    this.procesandoMatricula = postulante.matricula;
    this.postulacionService.marcarContratado(vacante.idBolsaTrabajo, postulante.matricula).subscribe({
      next: () => {
        this.procesandoMatricula = null;
        this.mensajeExito = 'Postulante marcado como contratado.';
        this.cargarPostulantes(vacante);
        this.cargarConteosPostulantes();
      },
      error: () => {
        this.procesandoMatricula = null;
        this.mensajeError = 'No se pudo marcar como contratado.';
      }
    });
  }

  exportarPostulantes(vacante: BolsaTrabajo): void {
    if (!this.postulantes.length) {
      this.mensajeError = 'No hay postulantes para exportar.';
      return;
    }

    const filas = [
      ['Egresado', 'Matricula', 'Estado', 'Fecha aplicacion', 'Fecha contratacion'],
      ...this.postulantes.map(p => [
        this.nombreCompletoPostulante(p),
        p.matricula,
        p.estado,
        p.fechaAplicacion || '',
        p.fechaContratacion || ''
      ])
    ];

    const csv = filas
      .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postulantes_${vacante.idBolsaTrabajo}_${vacante.nombreEmpresa.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportarVacantes(): void {
    const filas = [
      ['Empresa', 'Puesto', 'Modalidad', 'Salario', 'Correo', 'Telefono', 'Carreras', 'Activo'],
      ...this.vacantesFiltradas.map(v => [
        v.nombreEmpresa,
        v.puesto,
        this.modalidadLabel(v),
        v.salarioOfertado ?? '',
        v.correoContacto || '',
        v.telefonoContacto || '',
        this.nombresCarreras(v),
        v.activo === false ? 'No' : 'Si'
      ])
    ];

    const csv = filas
      .map(fila => fila.map(celda => `"${String(celda).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vacantes_bolsa_trabajo.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  cargarPostulantes(vacante: BolsaTrabajo): void {
    this.cargandoPostulantes = true;
    this.postulantes = [];
    this.estadisticas = null;

    this.postulacionService.listarPorVacante(vacante.idBolsaTrabajo).subscribe({
      next: (data) => {
        this.postulantes = data || [];
        this.cargandoPostulantes = false;
        this.conteoPostulantes[vacante.idBolsaTrabajo] = this.postulantes.length;
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

  private cargarConteosPostulantes(): void {
    if (!this.vacantes.length) {
      this.conteoPostulantes = {};
      return;
    }

    const peticiones = this.vacantes.map(v =>
      this.postulacionService.obtenerEstadisticas(v.idBolsaTrabajo).pipe(
        catchError(() => of({ totalPostulaciones: 0, totalAplicados: 0, totalContratados: 0 }))
      )
    );

    forkJoin(peticiones).subscribe(stats => {
      const mapa: Record<number, number> = {};
      this.vacantes.forEach((v, i) => {
        mapa[v.idBolsaTrabajo] = stats[i]?.totalPostulaciones ?? 0;
      });
      this.conteoPostulantes = mapa;
    });
  }

  private normalizarModalidad(modalidad: string): string {
    const valor = (modalidad || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

    if (valor.startsWith('hibrid')) return 'hibrida';
    if (valor.startsWith('remot')) return 'remota';
    if (valor.startsWith('presenc')) return 'presencial';
    return valor;
  }
}
