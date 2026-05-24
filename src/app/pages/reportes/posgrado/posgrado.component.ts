import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosgradoService } from '../../../services/posgrado.service';
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

  // Métricas
  totalConPosgrado = 0;
  nivelMasFrecuente = '';
  estatusMasFrecuente = '';
  porcentajeConBeca = 0;

  private charts: Chart[] = [];

  constructor(private posgradoService: PosgradoService) {}

  ngOnInit() {
    this.posgradoService.getEgresados().subscribe({
      next: (egresados) => {
        this.todosEgresados = egresados || [];
        this.posgradoService.getPosgrados().subscribe({
          next: (posgrados) => {
            this.todosPosgrados = posgrados || [];
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
      ['Maestria', 'Doctorado'], [V1, AZ]
    );

    // 2. Modalidad - doughnut
    this.crearGraficaDoughnut('chartModalidad', posgrados, 'modalidad',
      ['Presencial', 'Virtual', 'Híbrido'], [V1, V2, V3]
    );

    // 3. Estatus - bar
    this.crearGraficaBar('chartEstatus', posgrados, 'estatus',
      ['En curso', 'Finalizado', 'Pausado'], [V1, V2, G1]
    );

    // 4. Tiene beca - pie
    const conBeca = posgrados.filter(p => p.tieneBeca).length;
    const sinBeca = posgrados.filter(p => !p.tieneBeca).length;
    this.crearGraficaPieDirecta('chartBeca',
      ['Con beca', 'Sin beca'], [conBeca, sinBeca], [V1, G1]
    );

    // 5. Tipo de beca - bar
    const nombresBeca = new Set<string>();
    posgrados.forEach(p => {
      (p.tiposBeca || []).forEach((b: any) => b?.nombre && nombresBeca.add(b.nombre));
      if (p.tipoBeca?.nombre) nombresBeca.add(p.tipoBeca.nombre);
    });
    const tiposBeca = Array.from(nombresBeca);
    const datosBeca = tiposBeca.map(t =>
      posgrados.filter(p =>
        (p.tiposBeca || []).some((b: any) => b.nombre === t) || p.tipoBeca?.nombre === t
      ).length
    );
    this.crearGraficaBarDirecta('chartTipoBeca',
      tiposBeca, datosBeca, [V1, V2, V3, AZ]
    );

    // 6. Relacionado con carrera - doughnut
    this.crearGraficaDoughnut('chartRelacionado', posgrados, 'relacionadoCarrera',
      ['Sí', 'No', 'Un poco'], [V1, G1, V3]
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