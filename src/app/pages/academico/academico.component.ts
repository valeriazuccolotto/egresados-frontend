import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Academico } from '../../models/academico';
import { Carrera } from '../../models/carrera';
import { AcademicoService } from '../../services/academico.service';
import { fechaHoyLocal } from '../../utils/fecha-hoy.util';

@Component({
  selector: 'app-academico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './academico.component.html',
  styleUrl: './academico.component.css'
})
export class AcademicoComponent implements OnInit {

  mensajeExito = '';
  mensajeError = '';

  carreras: Carrera[] = [];

  academico: Academico = {
    matricula: '',
    claveCarrera: '',
    promedio: null,
    anioEgreso: null,

    titulado: 'No',
    fechaTitulacion: null,
    tipoTitulacion: null,
    cedulaProfesional: 'No',

    nombreTesis: null,
    director: null,
    codirector: null,

    fechaExamen: null,
    puntajeCeneval: null,

    tituloMemoria: null,
    asesor: null
  };

  constructor(private academicoService: AcademicoService) {}

  ngOnInit(): void {
    this.cargarCarreras();
    const raw = sessionStorage.getItem('usuario');

  if (!raw) {
    console.error('No hay usuario en sesión');
    return;
  }

  const usuario = JSON.parse(raw);
  this.academico.matricula = usuario.matricula;
        this.cargarAcademico();


  }

  cargarCarreras(): void {
    this.academicoService.obtenerCarreras().subscribe({
      next: (data) => {
        this.carreras = data;
      },
      error: () => {
        this.mensajeError = 'Error al cargar carreras.';
      }
    });
  }

  guardar(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.academico.matricula.trim()) {
      this.mensajeError = 'La matrícula es obligatoria.';
      return;
    }

    if (!this.academico.claveCarrera) {
      this.mensajeError = 'La carrera es obligatoria.';
      return;
    }

    if (this.academico.promedio === null) {
      this.mensajeError = 'El promedio es obligatorio.';
      return;
    }

    if (!this.academico.anioEgreso) {
      this.mensajeError = 'El año de egreso es obligatorio.';
      return;
    }

    if (!this.academico.titulado) {
      this.mensajeError = 'Debes indicar si está titulado.';
      return;
    }

    if (!this.academico.cedulaProfesional) {
      this.mensajeError = 'Debes indicar si tiene cédula profesional.';
      return;
    }

    if (this.academico.titulado === 'Si') {
      if (!this.academico.fechaTitulacion) {
        this.mensajeError = 'La fecha de titulación es obligatoria.';
        return;
      }

      if (!this.academico.tipoTitulacion) {
        this.mensajeError = 'El tipo de titulación es obligatorio.';
        return;
      }

      if (this.academico.tipoTitulacion === 'Tesis') {
        if (!this.academico.nombreTesis || !this.academico.director) {
          this.mensajeError = 'Nombre de tesis y director son obligatorios.';
          return;
        }
      }

      if (this.academico.tipoTitulacion === 'CENEVAL') {
        if (!this.academico.fechaExamen || this.academico.puntajeCeneval === null) {
          this.mensajeError = 'Fecha de examen y puntaje CENEVAL son obligatorios.';
          return;
        }
      }

      if (this.academico.tipoTitulacion === 'Experiencia laboral') {
        if (!this.academico.tituloMemoria || !this.academico.fechaExamen) {
          this.mensajeError = 'Título de memoria y fecha de examen son obligatorios.';
          return;
        }
      }
    }

    this.prepararDatosAntesDeGuardar();

    this.academicoService.obtenerPorMatricula(this.academico.matricula).subscribe({
      next: () => {
        this.actualizarAcademico();
      },
      error: () => {
        this.guardarAcademicoNuevo();
      }
    });
  }

  private guardarAcademicoNuevo(): void {
    this.academicoService.guardar(this.academico).subscribe({
      next: () => {
        this.mensajeExito = '✓ Información académica guardada correctamente.';
        this.mensajeError = '';
      },
      error: () => {
        this.mensajeExito = '';
        this.mensajeError = 'Error al guardar información académica.';
      }
    });
  }

  cargarAcademico(): void {
  this.academicoService.obtenerPorMatricula(this.academico.matricula).subscribe({
    next: (data: any) => {
      const clave = String(
        data.claveCarrera ??
        data.clave_carrera ??
        data.carrera?.claveCarrera ??
        ''
      );

      this.academico = {
  ...this.academico,
  ...data,

  matricula: this.academico.matricula,
  claveCarrera: clave,

  nombreTesis:
    data.nombreTesis ??
    data.tituloTesis ??
    data.tesis?.nombreTesis ??
    data.tesis?.tituloTesis ??
    '',

  director:
    data.director ??
    data.directorTesis ??
    data.tesis?.director ??
    data.tesis?.directorTesis ??
    '',

  codirector:
    data.codirector ??
    data.codirectorTesis ??
    data.tesis?.codirector ??
    data.tesis?.codirectorTesis ??
    '',

  fechaExamen:
    data.fechaExamen ??
    data.ceneval?.fechaExamen ??
    data.memoria?.fechaExamen ??
    null,

  puntajeCeneval:
    data.puntajeCeneval ??
    data.ceneval?.puntajeCeneval ??
    null,

  tituloMemoria:
    data.tituloMemoria ??
    data.memoria?.tituloMemoria ??
    '',

  asesor:
    data.asesor ??
    data.memoria?.asesor ??
    ''
};
    },
    error: (err) => {
      console.error('Error al cargar académico:', err);
    }
  });
}

private actualizarAcademico(): void {
    this.academicoService.actualizar(this.academico.matricula, this.academico).subscribe({
      next: () => {
        this.mensajeExito = '✓ Información académica actualizada correctamente.';
        this.mensajeError = '';
      },
      error: () => {
        this.mensajeExito = '';
        this.mensajeError = 'Error al actualizar información académica.';
      }
    });
  }

  onTituladoChange(): void {
    if (this.academico.titulado === 'Si' && !this.academico.fechaTitulacion) {
      this.academico.fechaTitulacion = fechaHoyLocal();
    }
  }

  onTipoTitulacionChange(): void {
    const requiereExamen =
      this.academico.tipoTitulacion === 'CENEVAL' ||
      this.academico.tipoTitulacion === 'Experiencia laboral';
    if (requiereExamen && !this.academico.fechaExamen) {
      this.academico.fechaExamen = fechaHoyLocal();
    }
  }

  private prepararDatosAntesDeGuardar(): void {
    if (this.academico.titulado === 'No') {
      this.academico.fechaTitulacion = null;
      this.academico.tipoTitulacion = null;
      this.limpiarDatosTitulacion();
      return;
    }

    if (this.academico.tipoTitulacion !== 'Tesis') {
      this.academico.nombreTesis = null;
      this.academico.director = null;
      this.academico.codirector = null;
    }

    if (this.academico.tipoTitulacion !== 'CENEVAL') {
      this.academico.puntajeCeneval = null;
    }

    if (this.academico.tipoTitulacion !== 'Experiencia laboral') {
      this.academico.tituloMemoria = null;
      this.academico.asesor = null;
    }

    if (
      this.academico.tipoTitulacion !== 'CENEVAL' &&
      this.academico.tipoTitulacion !== 'Experiencia laboral'
    ) {
      this.academico.fechaExamen = null;
    }
  }

  private limpiarDatosTitulacion(): void {
    this.academico.nombreTesis = null;
    this.academico.director = null;
    this.academico.codirector = null;
    this.academico.fechaExamen = null;
    this.academico.puntajeCeneval = null;
    this.academico.tituloMemoria = null;
    this.academico.asesor = null;
  }

}