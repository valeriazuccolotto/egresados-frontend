import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LaboralService } from '../../../services/laboral.service';
import { coloresPrestaciones, datosGraficaPrestaciones } from '../../../utils/prestaciones-reporte.util';
import {
  ETIQUETAS_COMO_CONSIGUIO,
  ETIQUETAS_MODALIDAD_LABORAL,
  ETIQUETAS_RELACION_CARRERA_LABORAL,
  ETIQUETAS_SALARIO,
  ETIQUETAS_SECTOR_LABORAL,
  ETIQUETAS_TIEMPO_EMPLEO,
  ETIQUETAS_TIPO_CONTRATO
} from '../../../utils/graficas-reporte.util';
import { repararTextoEnObjeto } from '../../../utils/texto-encoding.util';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-laboral',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './laboral.component.html',
  styleUrl: './laboral.component.css'
})
export class LaboralComponent implements OnInit, OnDestroy {

  campusSeleccionado = 'Todos';
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];

  todosLaborales: any[] = [];
  todosEgresados: any[] = [];
  catalogoPrestaciones: any[] = [];

  // Métricas
  totalConEmpleo = 0;
  sectorMasFrecuente = '';
  modalidadMasFrecuente = '';
  salarioMasFrecuente = '';

  private charts: Chart[] = [];

  constructor(private laboralService: LaboralService) {}

  ngOnInit() {
    this.laboralService.getPrestaciones().subscribe({
      next: (prestaciones) => {
        this.catalogoPrestaciones = (prestaciones || []).map(item => repararTextoEnObjeto(item));
        if (this.todosLaborales.length) {
          this.aplicarFiltro();
        }
      },
      error: () => {
        this.catalogoPrestaciones = [];
        if (this.todosLaborales.length) {
          this.aplicarFiltro();
        }
      }
    });

    this.laboralService.getEgresados().subscribe({
      next: (egresados) => {
        this.todosEgresados = (egresados || []).map((item: any) => repararTextoEnObjeto(item));
        this.laboralService.getLaborales().subscribe({
          next: (laborales) => {
            this.todosLaborales = (laborales || []).map((item: any) => repararTextoEnObjeto(item));
            this.aplicarFiltro();
          },
          error: () => {
            this.todosLaborales = [];
            this.aplicarFiltro();
          }
        });
      },
      error: () => {
        this.todosEgresados = [];
        this.todosLaborales = [];
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
    const laborales = this.todosLaborales.filter(l =>
      matriculasFiltradas.has(l.matricula)
    );

    this.calcularMetricas(laborales);
    this.destruirGraficas();
    setTimeout(() => this.construirGraficas(laborales), 100);
  }

  calcularMetricas(laborales: any[]) {
    this.totalConEmpleo = laborales.length;

    this.sectorMasFrecuente = this.moda(laborales.map(l => l.sector));
    this.modalidadMasFrecuente = this.moda(laborales.map(l => l.modalidadTrabajo));
    this.salarioMasFrecuente = this.moda(laborales.map(l => l.salario));
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

  construirGraficas(laborales: any[]) {
    const V1 = '#2f8f83';
    const V2 = '#52b0a4';
    const V3 = '#85cdc6';
    const G1 = '#9eaab3';
    const G2 = '#c8d0d5';
    const AZ = '#1a6e78';

    // 1. Sector - pie
    this.crearGraficaPie('chartSector', laborales, 'sector',
      [...ETIQUETAS_SECTOR_LABORAL],
      [V1, V2, V3, AZ, G1, G2]
    );

    // 2. Cómo consiguió - doughnut
    this.crearGraficaDoughnut('chartComoConsiguio', laborales, 'comoConsiguio',
      [...ETIQUETAS_COMO_CONSIGUIO],
      [V1, V2, V3, AZ]
    );

    // 3. Tiempo para conseguir - bar
    this.crearGraficaBar('chartTiempo', laborales, 'tiempoConseguir',
      [...ETIQUETAS_TIEMPO_EMPLEO],
      [V1, V2, V3, G1]
    );

    // 4. Tipo contrato - pie
    this.crearGraficaPie('chartContrato', laborales, 'tipoContrato',
      [...ETIQUETAS_TIPO_CONTRATO],
      [V1, G1]
    );

    // 5. Modalidad - doughnut
    this.crearGraficaDoughnut('chartModalidad', laborales, 'modalidadTrabajo',
      [...ETIQUETAS_MODALIDAD_LABORAL],
      [V1, V2, V3]
    );

    // 6. Salario - bar
    this.crearGraficaBar('chartSalario', laborales, 'salario',
      [...ETIQUETAS_SALARIO],
      [G2, V3, V2, V1, G1]
    );

    // 7. Relación carrera - doughnut
    this.crearGraficaDoughnut('chartRelacion', laborales, 'relacionCarrera',
      [...ETIQUETAS_RELACION_CARRERA_LABORAL],
      [V1, V2, V3, G1]
    );

    // 8. Prestaciones - bar horizontal
    this.crearGraficaPrestaciones('chartPrestaciones', laborales);
  }

  crearGraficaPie(id: string, laborales: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => laborales.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    this.charts.push(chart);
  }

  crearGraficaDoughnut(id: string, laborales: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => laborales.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    this.charts.push(chart);
  }

  crearGraficaBar(id: string, laborales: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => laborales.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    this.charts.push(chart);
  }

  crearGraficaPrestaciones(id: string, laborales: any[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;

    const { labels, values } = datosGraficaPrestaciones(this.catalogoPrestaciones, laborales);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Egresados',
          data: values,
          backgroundColor: coloresPrestaciones(labels.length)
        }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
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