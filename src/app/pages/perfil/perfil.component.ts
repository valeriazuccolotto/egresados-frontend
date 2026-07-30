import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PerfilService } from '../../services/perfil.service';
import { Perfil } from '../../models/perfil';
import { Usuario } from '../../models/usuario';
import { AcademicoService } from '../../services/academico.service';
import { Carrera } from '../../models/carrera';
import { BolsaTrabajo } from '../../models/bolsa-trabajo';
import { BolsaTrabajoService } from '../../services/bolsa-trabajo.service';
import { PostulacionBolsaTrabajoService } from '../../services/postulacion-bolsa-trabajo.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit, OnDestroy {

  perfil?: Perfil;
  urlFoto: string = 'assets/favicon-UNPA.ico';
  carrera: string = '';
  carreras: Carrera[] = [];
  claveCarrera = '';
  vacantesCarrera: BolsaTrabajo[] = [];
  matricula = '';
  indiceVacante = 0;
  vacanteSeleccionada: BolsaTrabajo | null = null;
  estadosPostulacion: Record<number, string> = {};
  procesando: Record<number, boolean> = {};
  mensajeBolsa = '';
  errorBolsa = '';

  private carruselTimer?: ReturnType<typeof setInterval>;

  constructor(
    public perfilService: PerfilService,
    private academicoService: AcademicoService,
    private bolsaTrabajoService: BolsaTrabajoService,
    private postulacionService: PostulacionBolsaTrabajoService
  ) {}

  ngOnInit(): void {
    this.perfilService.foto$.subscribe(url => {
      this.urlFoto = url;
    });

    this.cargarPerfil();
  }

  ngOnDestroy(): void {
    this.detenerCarrusel();
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
    this.matricula = matricula;

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

          this.claveCarrera = String(carreraEncontrada?.claveCarrera || claveAcademico || '');
          this.carrera =
            carreraEncontrada?.nombreCarrera ||
            academico?.nombreCarrera ||
            academico?.carrera?.nombreCarrera ||
            '';
          this.cargarVacantesCarrera();
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

  get hayVacantesCarrera(): boolean {
    return this.vacantesCarrera.length > 0;
  }

  get vacanteActual(): BolsaTrabajo | null {
    return this.vacantesCarrera[this.indiceVacante] || null;
  }

  anteriorVacante(): void {
    if (this.vacantesCarrera.length < 2) return;
    this.indiceVacante =
      (this.indiceVacante - 1 + this.vacantesCarrera.length) % this.vacantesCarrera.length;
    this.reiniciarCarrusel();
  }

  siguienteVacante(): void {
    if (this.vacantesCarrera.length < 2) return;
    this.indiceVacante = (this.indiceVacante + 1) % this.vacantesCarrera.length;
    this.reiniciarCarrusel();
  }

  irAVacante(indice: number): void {
    this.indiceVacante = indice;
    this.reiniciarCarrusel();
  }

  abrirDetalle(vacante: BolsaTrabajo): void {
    this.vacanteSeleccionada = vacante;
    this.detenerCarrusel();
    this.mensajeBolsa = '';
    this.errorBolsa = '';
  }

  cerrarDetalle(): void {
    this.vacanteSeleccionada = null;
    this.iniciarCarrusel();
  }

  estadoPostulacion(vacante: BolsaTrabajo): string {
    return this.estadosPostulacion[vacante.idBolsaTrabajo] || 'Sin aplicar';
  }

  puedeAplicar(vacante: BolsaTrabajo): boolean {
    return this.estadoPostulacion(vacante) === 'Sin aplicar';
  }

  puedeMarcarContratado(vacante: BolsaTrabajo): boolean {
    return this.estadoPostulacion(vacante) === 'Aplicado';
  }

  aplicarVacante(vacante: BolsaTrabajo): void {
    if (!this.matricula || this.procesando[vacante.idBolsaTrabajo]) return;

    this.procesando[vacante.idBolsaTrabajo] = true;
    this.mensajeBolsa = '';
    this.errorBolsa = '';
    this.postulacionService.aplicar(vacante.idBolsaTrabajo, this.matricula).subscribe({
      next: () => {
        this.estadosPostulacion[vacante.idBolsaTrabajo] = 'Aplicado';
        this.procesando[vacante.idBolsaTrabajo] = false;
        this.mensajeBolsa = 'Has aplicado a esta vacante correctamente.';
        this.vacantesCarrera = this.vacantesCarrera.filter(
          item => item.idBolsaTrabajo !== vacante.idBolsaTrabajo
        );
        this.indiceVacante = Math.min(this.indiceVacante, Math.max(0, this.vacantesCarrera.length - 1));
        this.vacanteSeleccionada = null;
        this.iniciarCarrusel();
      },
      error: () => {
        this.procesando[vacante.idBolsaTrabajo] = false;
        this.errorBolsa = 'No se pudo registrar tu aplicación.';
      }
    });
  }

  marcarComoContratado(vacante: BolsaTrabajo): void {
    if (!this.matricula || this.procesando[vacante.idBolsaTrabajo]) return;
    if (!confirm('¿Confirmas que fuiste contratado en esta vacante?')) return;

    this.procesando[vacante.idBolsaTrabajo] = true;
    this.mensajeBolsa = '';
    this.errorBolsa = '';
    this.postulacionService.marcarContratado(vacante.idBolsaTrabajo, this.matricula).subscribe({
      next: () => {
        this.estadosPostulacion[vacante.idBolsaTrabajo] = 'Contratado';
        this.procesando[vacante.idBolsaTrabajo] = false;
        this.mensajeBolsa = 'La contratación fue registrada en tu información laboral.';
      },
      error: () => {
        this.procesando[vacante.idBolsaTrabajo] = false;
        this.errorBolsa = 'No se pudo registrar la contratación.';
      }
    });
  }

  nombresCarreras(vacante: BolsaTrabajo): string {
    return (vacante.carreras || [])
      .map(item => item.nombreCarrera || item.claveCarrera)
      .filter(Boolean)
      .join(', ');
  }

  private cargarVacantesCarrera(): void {
    if (!this.claveCarrera && !this.carrera) {
      this.vacantesCarrera = [];
      return;
    }

    this.bolsaTrabajoService.getVacantesActivas().subscribe({
      next: (vacantes) => {
        const vacantesDeCarrera = (vacantes || []).filter(vacante =>
          (vacante.carreras || []).some(item =>
            item.claveCarrera === this.claveCarrera ||
            item.nombreCarrera === this.carrera
          )
        );

        this.postulacionService.obtenerPorMatricula(this.matricula).subscribe({
          next: postulaciones => {
            const idsPostulados = new Set(
              (postulaciones || []).map(postulacion => postulacion.idBolsaTrabajo)
            );
            this.vacantesCarrera = vacantesDeCarrera.filter(
              vacante => !idsPostulados.has(vacante.idBolsaTrabajo)
            );
            this.indiceVacante = 0;
            this.iniciarCarrusel();
          },
          error: () => {
            this.vacantesCarrera = vacantesDeCarrera;
            this.indiceVacante = 0;
            this.cargarEstadosPostulacion();
            this.iniciarCarrusel();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar vacantes:', err);
        this.vacantesCarrera = [];
      }
    });
  }

  private cargarEstadosPostulacion(): void {
    this.vacantesCarrera.forEach(vacante => {
      this.postulacionService.obtenerPostulacion(vacante.idBolsaTrabajo, this.matricula).subscribe({
        next: res => this.estadosPostulacion[vacante.idBolsaTrabajo] = res?.estado || 'Sin aplicar',
        error: () => this.estadosPostulacion[vacante.idBolsaTrabajo] = 'Sin aplicar'
      });
    });
  }

  private iniciarCarrusel(): void {
    this.detenerCarrusel();
    if (this.vacantesCarrera.length > 1 && !this.vacanteSeleccionada) {
      this.carruselTimer = setInterval(() => {
        this.indiceVacante = (this.indiceVacante + 1) % this.vacantesCarrera.length;
      }, 7000);
    }
  }

  private reiniciarCarrusel(): void {
    this.iniciarCarrusel();
  }

  private detenerCarrusel(): void {
    if (this.carruselTimer) {
      clearInterval(this.carruselTimer);
      this.carruselTimer = undefined;
    }
  }

}
