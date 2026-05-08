import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../layout/admin-layout/admin-layout.component';
import { EgresadoVistaService } from '../../services/egresado-vista.service';
import { EgresadoVista } from '../../models/egresado-vista';

interface CarreraGrupo {
  nombre: string;
  usuarios: EgresadoVista[];
}

interface SeccionGrupo {
  tipo: string;
  label: string;
  badgeClass: string;
  carreras: CarreraGrupo[];
}

@Component({
  selector: 'app-usuarios-adm',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './usuarios-adm.component.html',
  styleUrl: './usuarios-adm.component.css'
})
export class UsuariosAdmComponent implements OnInit {

  lista: EgresadoVista[] = [];
  busqueda = '';
  campusFiltro = '';
  estatusFiltro = 'todos';

  // ── Concentrado (mostrar todos o solo 5) ──────────────────
  concentradoActivo = false;

  // ── Filtro por carreras ───────────────────────────────────
  carrerasSeleccionadas: string[] = [];
  mostrarFiltroCarreras = false;

  readonly todasLasCarreras = [
    'Ingeniería en Agronomía',
    'Ingeniería en Ciencia de Datos y Matemáticas',
    'Ingeniería en Computación',
    'Ingeniería en Diseño',
    'Ingeniería en Mecatrónica',
    'Licenciatura en Biología Sostenible',
    'Licenciatura en Medicina Veterinaria y Zootecnia',
    'Maestría en Optimización y Control de Sistemas',
    'Maestría en Producción y Procesamiento Agrícola',
    'Maestría en Producción y Procesamiento Pecuario',
  ];

  constructor(private service: EgresadoVistaService) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(data => this.lista = data);
  }

  // ── Métricas ──────────────────────────────────────────────
  get totalUsuarios() { return this.lista.length; }

  get totalContestadas() {
    return this.lista.filter(u => u.estatusEncuesta === 'Contestada').length;
  }

  get totalPendientes() {
    return this.lista.filter(u => u.estatusEncuesta === 'Pendiente').length;
  }

  get tasaRespuesta(): string {
    if (!this.lista.length) return '0%';
    return Math.round((this.totalContestadas / this.lista.length) * 100) + '%';
  }

  // ── Toggle concentrado ────────────────────────────────────
  toggleConcentrado() {
    this.concentradoActivo = !this.concentradoActivo;
  }

  // ── Filtro de carreras ────────────────────────────────────
  toggleFiltroCarreras() {
    this.mostrarFiltroCarreras = !this.mostrarFiltroCarreras;
  }

  toggleCarrera(carrera: string) {
    const idx = this.carrerasSeleccionadas.indexOf(carrera);
    if (idx === -1) {
      this.carrerasSeleccionadas.push(carrera);
    } else {
      this.carrerasSeleccionadas.splice(idx, 1);
    }
  }

  seleccionarTodas() {
    this.carrerasSeleccionadas = [];
  }

  isCarreraSeleccionada(carrera: string): boolean {
    return this.carrerasSeleccionadas.includes(carrera);
  }

  get labelCarrerasFiltro(): string {
    if (this.carrerasSeleccionadas.length === 0) return 'Todas las carreras';
    if (this.carrerasSeleccionadas.length === 1) return this.carrerasSeleccionadas[0];
    return `${this.carrerasSeleccionadas.length} carreras seleccionadas`;
  }

  // ── Filtrado general ──────────────────────────────────────
  get listaFiltrada(): EgresadoVista[] {
    const texto = this.busqueda.toLowerCase().trim();
    return this.lista.filter(u => {
      const coincideTexto = !texto || (
        u.nombre.toLowerCase().includes(texto) ||
        u.apellidoPaterno.toLowerCase().includes(texto) ||
        u.matricula.toLowerCase().includes(texto) ||
        u.carrera.toLowerCase().includes(texto)
      );
      const coincideCampus  = !this.campusFiltro || u.campus === this.campusFiltro;
      const coincideEstatus = this.estatusFiltro === 'todos' || u.estatusEncuesta === this.estatusFiltro;
      const coincideCarrera = this.carrerasSeleccionadas.length === 0 ||
                              this.carrerasSeleccionadas.includes(u.carrera);
      return coincideTexto && coincideCampus && coincideEstatus && coincideCarrera;
    });
  }

  // ── Agrupación por sección y carrera ──────────────────────
  get secciones(): SeccionGrupo[] {
    const orden = [
      { tipo: 'Ingenieria',   label: 'Ingenierías',   badgeClass: 'badge-ing' },
      { tipo: 'Licenciatura', label: 'Licenciaturas', badgeClass: 'badge-lic' },
      { tipo: 'Maestria',     label: 'Maestrías',     badgeClass: 'badge-mae' },
    ];

    return orden.map(sec => {
      const usuariosTipo = this.listaFiltrada.filter(u => u.tipoCarrera === sec.tipo);
      const mapa = new Map<string, EgresadoVista[]>();
      usuariosTipo.forEach(u => {
        if (!mapa.has(u.carrera)) mapa.set(u.carrera, []);
        mapa.get(u.carrera)!.push(u);
      });
      const carreras: CarreraGrupo[] = Array.from(mapa.entries())
        .map(([nombre, usuarios]) => ({ nombre, usuarios }));
      return { ...sec, carreras };
    }).filter(sec => sec.carreras.length > 0);
  }

  // ── Usuarios a mostrar según concentrado ──────────────────
  usuariosMostrados(usuarios: EgresadoVista[]): EgresadoVista[] {
    return this.concentradoActivo ? usuarios : usuarios.slice(0, 5);
  }

  hayMas(usuarios: EgresadoVista[]): boolean {
    return !this.concentradoActivo && usuarios.length > 5;
  }

  setEstatus(filtro: string) { this.estatusFiltro = filtro; }
}