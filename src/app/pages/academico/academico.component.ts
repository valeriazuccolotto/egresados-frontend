import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Academico } from '../../models/academico';
import { AcademicoService } from '../../services/academico.service';

@Component({
  selector: 'app-academico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './academico.component.html',
  styleUrl: './academico.component.css'
})
export class AcademicoComponent implements OnInit {

  mensajeExito = false;
  mensajeError = '';
  editando = false;

  campusSeleccionado = '';

  carreras = [
    { clave: 'AGRO', nombre: 'Agronomía' },
    { clave: 'CDAT', nombre: 'Ciencia de datos' },
    { clave: 'COMP', nombre: 'Ingeniería en Computación' },
    { clave: 'DIS', nombre: 'Diseño' },
    { clave: 'MEC', nombre: 'Mecatrónica' },
    { clave: 'BIO', nombre: 'Biología' },
    { clave: 'VET', nombre: 'Veterinaria' }
  ];

  academicos: Academico[] = [];

  academico: Academico = {
    matricula: '',
    claveCarrera: '',
    promedio: null,
    anioEgreso: null,
    titulado: '',
    fechaTitulacion: null,
    tipoTitulacion: '',
    cedulaProfesional: '',

    nombreTesis: '',
    director: '',
    codirector: '',

    fechaExamenCeneval: null,
    puntajeCeneval: null,

    tituloMemoria: '',
    asesor: '',
    fechaExamenMemoria: null
  };

  constructor(private academicoService: AcademicoService) {}

  ngOnInit(): void {
    this.cargarAcademicos();
  }

  cargarAcademicos(): void {
    this.academicoService.obtenerTodos().subscribe({
      next: (data) => {
        this.academicos = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  guardar(): void {
    this.mensajeExito = false;
    this.mensajeError = '';

    // 🔧 LIMPIEZA DE DATOS (CLAVE DEL PROBLEMA)
    if (this.academico.titulado === 'No') {
      this.academico.cedulaProfesional = 'No';
      this.academico.tipoTitulacion = null as any;
      this.academico.fechaTitulacion = null;

      // limpiar extras
      this.academico.nombreTesis = '';
      this.academico.director = '';
      this.academico.codirector = '';

      this.academico.fechaExamenCeneval = null;
      this.academico.puntajeCeneval = null;

      this.academico.tituloMemoria = '';
      this.academico.asesor = '';
      this.academico.fechaExamenMemoria = null;
    }

    console.log('Datos enviados:', this.academico);

    if (this.editando) {
      this.academicoService.actualizar(this.academico.matricula, this.academico).subscribe({
        next: () => {
          this.mensajeExito = true;
          this.limpiarFormulario();
          this.cargarAcademicos();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = err.error || 'Error al actualizar';
        }
      });
    } else {
      this.academicoService.crear(this.academico).subscribe({
        next: () => {
          this.mensajeExito = true;
          this.limpiarFormulario();
          this.cargarAcademicos();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = err.error || 'Error al guardar';
        }
      });
    }
  }

  editar(item: Academico): void {
    this.academico = { ...item };
    this.editando = true;
  }

  eliminar(matricula: string): void {
    if (!confirm('¿Eliminar registro?')) return;

    this.academicoService.eliminar(matricula).subscribe({
      next: () => {
        this.cargarAcademicos();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  limpiarFormulario(): void {
    this.academico = {
      matricula: '',
      claveCarrera: '',
      promedio: null,
      anioEgreso: null,
      titulado: '',
      fechaTitulacion: null,
      tipoTitulacion: '',
      cedulaProfesional: '',

      nombreTesis: '',
      director: '',
      codirector: '',

      fechaExamenCeneval: null,
      puntajeCeneval: null,

      tituloMemoria: '',
      asesor: '',
      fechaExamenMemoria: null
    };

    this.campusSeleccionado = '';
    this.editando = false;
  }

  mostrarTesis(): boolean {
    return this.academico.tipoTitulacion === 'Tesis';
  }

  mostrarCeneval(): boolean {
    return this.academico.tipoTitulacion === 'CENEVAL';
  }

  mostrarMemoria(): boolean {
    return this.academico.tipoTitulacion === 'Experiencia laboral';
  }
}