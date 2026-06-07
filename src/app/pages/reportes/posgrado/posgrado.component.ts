import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosgradoService } from '../../../services/posgrado.service';
import { coloresPrestaciones } from '../../../utils/prestaciones-reporte.util';
import { datosGraficaTipoBeca } from '../../../utils/tipo-beca-reporte.util';
import {
  ETIQUETAS_ESTATUS_POSGRADO,
  ETIQUETAS_MODALIDAD_POSGRADO,
  ETIQUETAS_NIVEL_POSGRADO,
  ETIQUETAS_RELACION_POSGRADO
} from '../../../utils/graficas-reporte.util';
import { repararTextoEnObjeto } from '../../../utils/texto-encoding.util';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-posgrado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posgrado.component.html',
  styleUrl: './posgrado.component.css'
})
export class PosgradoComponent implements OnInit, OnDestroy {

  campusSeleccionado = 'Todos';
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];

  todosPosgrados: any[] = [];
  todosEgresados: any[] = [];
  catalogoTiposBeca: any[] = [];

  // Métricas
  totalConPosgrado = 0;
  nivelMasFrecuente = '';
  estatusMasFrecuente = '';
  porcentajeConBeca = 0;

  private charts: Chart[] = [];

  constructor(private posgradoService: PosgradoService) {}

  ngOnInit() {
    this.posgradoService.getTiposBeca().subscribe({
      next: (tipos) => {
        this.catalogoTiposBeca = (tipos || []).map(item => repararTextoEnObjeto(item));
        if (this.todosPosgrados.length) {
          this.aplicarFiltro();
        }
      },
      error: () => {
        this.catalogoTiposBeca = [];
        if (this.todosPosgrados.length) {
          this.aplicarFiltro();
        }
      }
    });

    this.posgradoService.getEgresados().subscribe({
      next: (egresados) => {
        this.todosEgresados = (egresados || []).map((item: any) => repararTextoEnObjeto(item));
        this.posgradoService.getPosgrados().subscribe({
          next: (posgrados) => {
            this.todosPosgrados = (posgrados || []).map((item: any) => repararTextoEnObjeto(item));
            this.aplicarFiltro();
          },
          error: () => {
            this.todosPosgrados = [];
            this.aplicarFiltro();
          }
        });
      },
      error: () => {
        this.todosEgresados = [];
        this.todosPosgrados = [];
        this.aplicarFiltro();
      }
    });
  }

  cambiarCampus() {
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    let egresadosFiltrados = this.todosEgresados;

    if (this.campusSeleccionado !== 'Todos') {
      egresadosFiltrados = this.todosEgresados.filter(e =>
        e.campus === this.campusSeleccionado
      );
    }

    const matriculasFiltradas = new Set(egresadosFiltrados.map(e => e.matricula));
    const posgrados = this.todosPosgrados.filter(p =>
      matriculasFiltradas.has(p.matricula)
    );

    this.calcularMetricas(posgrados);
    this.destruirGraficas();
    setTimeout(() => this.construirGraficas(posgrados), 100);
  }

  calcularMetricas(posgrados: any[]) {
    this.totalConPosgrado = posgrados.length;
    this.nivelMasFrecuente = this.moda(posgrados.map(p => p.nivelEstudio));
    this.estatusMasFrecuente = this.moda(posgrados.map(p => p.estatus));
    const conBeca = posgrados.filter(p => p.tieneBeca).length;
    this.porcentajeConBeca = posgrados.length > 0
      ? Math.round((conBeca / posgrados.length) * 100) : 0;
  }

  moda(arr: string[]): string {
    const conteo: Record<string, number> = {};
    arr.filter(Boolean).forEach(v => conteo[v] = (conteo[v] || 0) + 1);
    return Object.keys(conteo).length > 0
      ? Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b)
      : 'N/A';
  }

  private normalizar(valor: any): string {
    return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  construirGraficas(posgrados: any[]) {
    const V1 = '#2f8f83';
    const V2 = '#52b0a4';
    const V3 = '#85cdc6';
    const G1 = '#9eaab3';
    const G2 = '#c8d0d5';
    const AZ = '#1a6e78';

    // 1. Nivel de estudio - pie
    this.crearGraficaPie('chartNivel', posgrados, 'nivelEstudio',
      [...ETIQUETAS_NIVEL_POSGRADO], [V1, AZ]
    );

    // 2. Modalidad - doughnut
    this.crearGraficaDoughnut('chartModalidad', posgrados, 'modalidad',
      [...ETIQUETAS_MODALIDAD_POSGRADO], [V1, V2, V3]
    );

    // 3. Estatus - bar
    this.crearGraficaBar('chartEstatus', posgrados, 'estatus',
      [...ETIQUETAS_ESTATUS_POSGRADO], [V1, V2, G1]
    );

    // 4. Tiene beca - pie
    const conBeca = posgrados.filter(p => p.tieneBeca).length;
    const sinBeca = posgrados.filter(p => !p.tieneBeca).length;
    this.crearGraficaPieDirecta('chartBeca',
      ['Con beca', 'Sin beca'], [conBeca, sinBeca], [V1, G1]
    );

    // 5. Tipo de beca - bar
    const { labels: tiposBeca, values: datosBeca } = datosGraficaTipoBeca(this.catalogoTiposBeca, posgrados);
    this.crearGraficaBarDirecta(
      'chartTipoBeca',
      tiposBeca,
      datosBeca,
      coloresPrestaciones(tiposBeca.length)
    );

    // 6. Relacionado con carrera - doughnut
    this.crearGraficaDoughnut('chartRelacionado', posgrados, 'relacionadoCarrera',
      [...ETIQUETAS_RELACION_POSGRADO], [V1, G1, V3]
    );
  }

  crearGraficaPie(id: string, datos: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => datos.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    this.charts.push(chart);
  }

  crearGraficaPieDirecta(id: string, labels: string[], data: number[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    this.charts.push(chart);
  }

  crearGraficaDoughnut(id: string, datos: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => datos.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    this.charts.push(chart);
  }

  crearGraficaBar(id: string, datos: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => datos.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    this.charts.push(chart);
  }

  crearGraficaBarDirecta(id: string, labels: string[], data: number[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    this.charts.push(chart);
  }

  destruirGraficas() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  ngOnDestroy() {
    this.destruirGraficas();
  }
}