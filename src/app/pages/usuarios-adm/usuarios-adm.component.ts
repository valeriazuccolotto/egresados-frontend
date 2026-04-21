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

  // ── Filtrado ──────────────────────────────────────────────
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
      return coincideTexto && coincideCampus && coincideEstatus;
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

  setEstatus(filtro: string) { this.estatusFiltro = filtro; }
}