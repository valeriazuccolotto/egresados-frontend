import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { EgresadoService } from '../../services/egresado/egresado.service';

@Component({
  selector: 'app-datos-recuperados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './datos-recuperados.component.html',
  styleUrls: ['./datos-recuperados.component.css']
})
export class DatosRecuperadosComponent implements OnInit {

  // =========================
  // BÚSQUEDA
  // =========================

  matricula: string = '';

  // =========================
  // RESULTADO
  // =========================

  resultado: any = null;

  cargando: boolean = false;

  // =========================
  // CAMPUS
  // =========================

  campusSeleccionado: string = '';

  // =========================
  // FILTROS SELECCIONADOS
  // =========================

  carreraSeleccionada: string = '';

  generacionSeleccionada: string = '';

  // =========================
  // CARRERAS POR CAMPUS
  // =========================

  carrerasPorCampus: { [key: string]: string[] } = {

    'Loma Bonita': [

      'Ingeniería en Agronomía',
      'Ingeniería Agrícola Tropical',
      'Ingeniería en Ciencia de Datos',
      'Ingeniería en Computación',
      'Ingeniería en Diseño',
      'Ingeniería en Mecatrónica',
      'Licenciatura en Biología Sostenible',
      'Licenciatura en Medicina Veterinaria y Zootecnia'

    ],

    'Tuxtepec': [

      'Licenciatura en Medicina',
      'Licenciatura en Enfermería',
      'Químico Farmacobiólogo',
      'Ingeniería en Biotecnología',
      'Ingeniería en Alimentos',
      'Ingeniería en Innovación y Desarrollo Agropecuario',
      'Ciencias Empresariales'

    ]

  };

  // =========================
  // LISTAS
  // =========================

  carrerasFiltradas: string[] = [];

  generaciones: string[] = [

    '2020 - 2024',
    '2021 - 2025',
    '2022 - 2026'

  ];

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private egresadoService: EgresadoService
  ) {}

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {}

  // =========================
  // CAMBIO DE CAMPUS
  // =========================

  actualizarCarreras(): void {

    // limpiar carrera seleccionada
    this.carreraSeleccionada = '';

    // TODOS
    if (this.campusSeleccionado === 'Todos') {

      this.carrerasFiltradas = [

        ...this.carrerasPorCampus['Loma Bonita'],
        ...this.carrerasPorCampus['Tuxtepec']

      ];

      return;

    }

    // CAMPUS ESPECÍFICO
    this.carrerasFiltradas =
      this.carrerasPorCampus[this.campusSeleccionado] || [];

  }

  // =========================
  // BUSCAR EGRESADO
  // =========================

  buscarPorMatricula(): void {

    // evitar búsqueda vacía
    if (!this.matricula.trim()) {

      this.resultado = null;

      return;

    }

    this.cargando = true;

    this.egresadoService
      .getPerfilCompleto(this.matricula)
      .subscribe({

        next: (data) => {

          console.log(
            'Perfil encontrado:',
            data
          );

          this.resultado = data;

          this.cargando = false;

        },

        error: (err) => {

          console.error(
            'Error buscando egresado',
            err
          );

          this.resultado = null;

          this.cargando = false;

        }

      });

  }

  // =========================
  // FILTRAR
  // =========================

  filtrar(): void {

    console.log(
      'Campus:',
      this.campusSeleccionado
    );

    console.log(
      'Carrera:',
      this.carreraSeleccionada
    );

    console.log(
      'Generación:',
      this.generacionSeleccionada
    );

    // 🔥 después conectarás tu endpoint real

  }

}