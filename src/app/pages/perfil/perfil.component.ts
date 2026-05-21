import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PerfilService } from '../../services/perfil.service';
import { Perfil } from '../../models/perfil';
import { Usuario } from '../../models/usuario';
import { AcademicoService } from '../../services/academico.service';
import { Carrera } from '../../models/carrera';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  perfil?: Perfil;
  urlFoto: string = 'assets/favicon-UNPA.ico';
  carrera: string = '';
  carreras: Carrera[] = [];

  constructor(
    public perfilService: PerfilService,
    private academicoService: AcademicoService
  ) {}

  ngOnInit(): void {
    this.perfilService.foto$.subscribe(url => {
      this.urlFoto = url;
    });

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    const raw = sessionStorage.getItem('usuario');

    if (!raw) {
      console.error('No hay usuario en sesión.');
      return;
    }

    const usuario: Usuario = JSON.parse(raw);
    const matricula = this.perfilService.normalizarMatricula(usuario.matricula);
    if (!matricula || !/^\d{8}$/.test(matricula)) {
      console.warn('La vista de perfil de egresado no aplica para cuentas administrativas.');
      return;
    }

    this.perfilService.obtenerPerfil(matricula).subscribe({
      next: (data: Perfil) => {
        this.perfil = data;

        const foto = this.perfilService.resolverUrlFoto(data.urlFoto);
        this.urlFoto = foto;
        this.perfilService.setFoto(foto);

        this.cargarAcademico(matricula);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });
  }

  cargarAcademico(matricula: string): void {
  this.academicoService.obtenerPorMatricula(matricula).subscribe({
    next: (academico: any) => {
      this.academicoService.obtenerCarreras().subscribe({
        next: (carreras: Carrera[]) => {
          const claveAcademico =
            academico?.claveCarrera ||
            academico?.carrera?.claveCarrera ||
            academico?.carrera;

          const carreraEncontrada = carreras.find(
            c => c.claveCarrera === claveAcademico
          );

          this.carrera =
            carreraEncontrada?.nombreCarrera ||
            academico?.nombreCarrera ||
            academico?.carrera?.nombreCarrera ||
            '';
        },
        error: (err) => {
          console.error('Error al cargar carreras:', err);
          this.carrera = '';
        }
      });
    },
    error: (err) => {
      console.error('Error al cargar académico:', err);
      this.carrera = '';
    }
  });
}

}