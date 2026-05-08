import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AdminLayoutComponent } from '../../layout/layout/layout.component';
import { EgresadoService } from '../../services/egresado.service';

@Component({
  selector: 'app-datos-recuperados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule, // 🔥 necesario para HttpClient
    AdminLayoutComponent
  ],
  templateUrl: './datos-recuperados.component.html',
  styleUrls: ['./datos-recuperados.component.css']
})
export class DatosRecuperadosComponent implements OnInit {

  // ================= UI =================
  menu = true;

  // ================= BUSQUEDA =================
  matricula: string = '';
  resultado: any = null;

  // ================= FILTRO =================
  carreraSeleccionada: string = '';
  generacionSeleccionada: string | null = null;

  carreras: string[] = [];
  generaciones: (string | number)[] = [];

  // ================= CONTROL SECCIONES =================
  secciones: any = {
    academico: false,
    laboral: false,
    posgrado: false,
    certificaciones: false,
    reconocimientos: false
  };

  // ================= MODALES =================
  mostrarModal: any = {
    academico: false,
    laboral: false,
    posgrado: false,
    certificaciones: false,
    reconocimientos: false
  };

  constructor(private egresadoService: EgresadoService) {}

  ngOnInit(): void {
    // 🔥 cargar carreras y generaciones desde backend
    this.egresadoService.getCarreras().subscribe(data => {
      this.carreras = data;
    });

    this.egresadoService.getGeneraciones().subscribe(data => {
      this.generaciones = data;
    });
  }

  // ================= ACCIONES =================

  buscarPorMatricula() {
    if (!this.matricula.trim()) return;

    console.log('Buscar matrícula:', this.matricula);

    // 🔥 MOCK (luego API real)
    this.resultado = {
      nombre: 'Valeria',
      matricula: this.matricula,
      contacto: { correo: 'valeria@gmail.com', telefono: '2711234567' },
      academico: { resumen: 'Egresada de Ingeniería en Sistemas' },
      laboral: { empresa: 'Google' },
      posgrado: { programa: 'Maestría en IA' },
      certificaciones: { nombre: 'Scrum Master' },
      reconocimientos: { nombre: 'Mejor promedio' }
    };

    // reset secciones
    this.secciones = {
      academico: false,
      laboral: false,
      posgrado: false,
      certificaciones: false,
      reconocimientos: false
    };
  }

  filtrar() {
    console.log('Filtrar:', this.carreraSeleccionada, this.generacionSeleccionada);
    // 🔥 aquí puedes llamar a un endpoint que filtre egresados por carrera y generación
  }

  toggle(seccion: string) {
    this.secciones[seccion] = !this.secciones[seccion];
  }

  abrirModal(tipo: string) {
    this.mostrarModal[tipo] = true;
  }

  cerrarModal(tipo: string) {
    this.mostrarModal[tipo] = false;
  }
}
