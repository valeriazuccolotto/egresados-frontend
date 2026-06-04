import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { resolverEstadoTrabajo } from '../../../../utils/estados-mexico-coords.util';
import {
  conteoPorEstadoDesdeMarcadores,
  EstadoMapaSvg,
  geoJsonAMapasEstados,
  MexicoGeoCollection
} from '../../../../utils/mexico-geo.util';

export interface EgresadoEnMapa {
  matricula: string;
  nombreCompleto: string;
  campus: string;
  carrera: string;
  empresa: string;
  puesto: string;
  sector: string;
  estadoTrabajo: string;
  modalidadTrabajo: string;
  salario: string;
  tipoContrato: string;
}

export interface MarcadorMapaLaboral {
  estado: string;
  x: number;
  y: number;
  esExtranjero: boolean;
  egresados: EgresadoEnMapa[];
}

@Component({
  selector: 'app-mapa-ubicacion-laboral',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-ubicacion.component.html',
  styleUrl: './mapa-ubicacion.component.css'
})
export class MapaUbicacionLaboralComponent implements OnInit {

  campusSeleccionado = 'Todos';
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];

  cargando = true;
  mapaListo = false;
  sinDatos = false;
  estadosMapa: EstadoMapaSvg[] = [];
  conteoPorEstado: Record<string, number> = {};
  marcadores: MarcadorMapaLaboral[] = [];
  marcadorActivo: MarcadorMapaLaboral | null = null;
  panelFijado = false;

  private egresados: any[] = [];
  private academicos: any[] = [];
  private laborales: any[] = [];
  private centroidsPorEstado = new Map<string, { x: number; y: number }>();

  constructor(
    private graficas: GraficasDataService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    forkJoin({
      geo: this.http.get<MexicoGeoCollection>('assets/maps/mexicoLow.json'),
      egresados: this.graficas.getEgresados(),
      academicos: this.graficas.getAcademicos(),
      laborales: this.graficas.getLaborales()
    }).subscribe({
      next: ({ geo, egresados, academicos, laborales }) => {
        this.estadosMapa = geoJsonAMapasEstados(geo);
        this.centroidsPorEstado = new Map(
          this.estadosMapa.map(s => [s.estado, s.centroid])
        );
        this.egresados = egresados || [];
        this.academicos = academicos || [];
        this.laborales = laborales || [];
        this.mapaListo = true;
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
        this.sinDatos = true;
      }
    });
  }

  cambiarCampus(): void {
    this.cerrarPanel();
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (!this.mapaListo) {
      return;
    }
    const laboralesFiltrados = this.graficas.filtrarPorCampus(
      this.laborales,
      this.egresados,
      this.campusSeleccionado
    );
    this.construirMarcadores(laboralesFiltrados);
  }

  private construirMarcadores(laborales: any[]): void {
    const egresadoPorMatricula = new Map(
      this.egresados.map(e => [e.matricula, e])
    );
    const academicoPorMatricula = new Map(
      this.academicos.map(a => [a.matricula, a])
    );

    const porEstado = new Map<string, EgresadoEnMapa[]>();

    for (const lab of laborales) {
      const estadoRaw = lab.estadoTrabajo ?? lab.estado_trabajo;
      const estado = resolverEstadoTrabajo(estadoRaw);
      if (!estado) {
        continue;
      }

      const eg = egresadoPorMatricula.get(lab.matricula);
      const acad = academicoPorMatricula.get(lab.matricula);
      const nombreCompleto = eg
        ? [eg.nombre, eg.apellidoPaterno, eg.apellidoMaterno].filter(Boolean).join(' ')
        : `Matrícula ${lab.matricula}`;

      const item: EgresadoEnMapa = {
        matricula: lab.matricula,
        nombreCompleto,
        campus: eg?.campus || '—',
        carrera:
          acad?.carrera?.nombreCarrera ??
          acad?.nombreCarrera ??
          acad?.carrera?.claveCarrera ??
          acad?.claveCarrera ??
          '—',
        empresa: lab.empresa || '—',
        puesto: lab.puesto || '—',
        sector: lab.sector || '—',
        estadoTrabajo: estado,
        modalidadTrabajo: lab.modalidadTrabajo || '—',
        salario: lab.salario || '—',
        tipoContrato: lab.tipoContrato || '—'
      };

      const lista = porEstado.get(estado) ?? [];
      lista.push(item);
      porEstado.set(estado, lista);
    }

    this.marcadores = Array.from(porEstado.entries())
      .map(([estado, egresadosEnEstado]) => {
        const centroid = this.centroidsPorEstado.get(estado);
        if (!centroid && estado !== 'Extranjero') {
          return null;
        }
        const coords =
          estado === 'Extranjero'
            ? { x: 960, y: 325 }
            : centroid!;
        return {
          estado,
          x: coords.x,
          y: coords.y,
          esExtranjero: estado === 'Extranjero',
          egresados: egresadosEnEstado.sort((a, b) =>
            a.nombreCompleto.localeCompare(b.nombreCompleto, 'es')
          )
        } as MarcadorMapaLaboral;
      })
      .filter((m): m is MarcadorMapaLaboral => m !== null)
      .sort((a, b) => a.estado.localeCompare(b.estado, 'es'));

    this.conteoPorEstado = conteoPorEstadoDesdeMarcadores(this.marcadores);
    this.sinDatos = this.marcadores.length === 0;

    if (
      this.marcadorActivo &&
      !this.marcadores.some(m => m.estado === this.marcadorActivo!.estado)
    ) {
      this.cerrarPanel();
    }
  }

  totalEgresadosEnMapa(): number {
    return this.marcadores.reduce((sum, m) => sum + m.egresados.length, 0);
  }

  onEstadoHover(estado: string): void {
    const marcador = this.marcadores.find(m => m.estado === estado);
    if (marcador) {
      this.marcadorActivo = marcador;
    }
  }

  onEstadoLeave(): void {
    if (!this.panelFijado) {
      this.marcadorActivo = null;
    }
  }

  onEstadoClick(estado: string, event: Event): void {
    const marcador = this.marcadores.find(m => m.estado === estado);
    if (!marcador) {
      return;
    }
    this.fijarMarcador(marcador, event);
  }

  fijarMarcador(marcador: MarcadorMapaLaboral, event: Event): void {
    event.stopPropagation();
    if (this.panelFijado && this.marcadorActivo?.estado === marcador.estado) {
      this.cerrarPanel();
      return;
    }
    this.marcadorActivo = marcador;
    this.panelFijado = true;
  }

  cerrarPanel(): void {
    this.marcadorActivo = null;
    this.panelFijado = false;
  }

  pinTransform(m: MarcadorMapaLaboral): string {
    return `translate(${m.x}, ${m.y})`;
  }

  get marcadoresMexico(): MarcadorMapaLaboral[] {
    return this.marcadores.filter(m => !m.esExtranjero);
  }

  get marcadorExtranjero(): MarcadorMapaLaboral | null {
    return this.marcadores.find(m => m.esExtranjero) ?? null;
  }
}
