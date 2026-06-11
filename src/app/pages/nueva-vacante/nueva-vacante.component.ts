import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vacante.matricula = this.obtenerMatriculaAdmin();
    this.cargarCarreras();
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

  toggleCarrera(claveCarrera: string): void {
    const idx = this.carrerasSeleccionadas.indexOf(claveCarrera);

    if (idx === -1) {
      this.carrerasSeleccionadas.push(claveCarrera);
    } else {
      this.carrerasSeleccionadas.splice(idx, 1);
    }

    this.vacante.carreras = this.carrerasSeleccionadas.map(claveCarrera => ({ claveCarrera }));
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
    this.vacante.carreras = this.carrerasSeleccionadas.map(claveCarrera => ({ claveCarrera }));

    this.bolsaTrabajoService.crearVacante(this.vacante).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = 'Vacante guardada correctamente.';
        setTimeout(() => this.router.navigate(['/admin/bolsaTrabajo']), 900);
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = 'Error al guardar la vacante.';
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

    if (this.vacante.salarioOfertado === null || this.vacante.salarioOfertado < 0) {
      this.mensajeError = 'El salario es obligatorio.';
      return false;
    }

    if (!this.vacante.modalidad) {
      this.mensajeError = 'La modalidad es obligatoria.';
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
