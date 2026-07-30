import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReconocimientosService } from '../../../services/reconocimientos.service';
import { ETIQUETAS_TIPO_RECONOCIMIENTO } from '../../../utils/graficas-reporte.util';
import {
  descargarGraficaPorId,
  descargarGraficasZip,
  GraficaDescarga
} from '../../../utils/descarga-graficas.util';
import { repararTextoEnObjeto } from '../../../utils/texto-encoding.util';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reconocimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reconocimientos.component.html',
  styleUrl: './reconocimientos.component.css'
})
export class ReconocimientosComponent implements OnInit, OnDestroy {

  campusSeleccionado = 'Todos';
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];

  todosReconocimientos: any[] = [];
  todosEgresados: any[] = [];
  reconocimientosFiltrados: any[] = [];

  // Métricas
  totalReconocimientos = 0;
  tipoMasFrecuente = '';
  institucionMasFrecuente = '';
  egresadosConReconocimiento = 0;

  descargandoTodas = false;

  readonly graficasDescarga: GraficaDescarga[] = [
    { canvasId: 'chartTipo', nombreArchivo: 'tipo-reconocimiento.png' },
    { canvasId: 'chartInstitucion', nombreArchivo: 'reconocimientos-por-institucion.png' }
  ];

  private charts: Chart[] = [];

  constructor(private reconocimientosService: ReconocimientosService) {}

  ngOnInit() {
    this.reconocimientosService.getEgresados().subscribe({
      next: (egresados) => {
        this.todosEgresados = (egresados || []).map(item => repararTextoEnObjeto(item));
        this.reconocimientosService.getReconocimientos().subscribe({
          next: (reconocimientos) => {
            this.todosReconocimientos = (reconocimientos || []).map(item => repararTextoEnObjeto(item));
            this.aplicarFiltro();
          },
          error: () => {
            this.todosReconocimientos = [];
            this.aplicarFiltro();
          }
        });
      },
      error: () => {
        this.todosEgresados = [];
        this.todosReconocimientos = [];
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
    this.reconocimientosFiltrados = this.todosReconocimientos.filter(r =>
      matriculasFiltradas.has(r.matricula)
    );

    this.calcularMetricas(this.reconocimientosFiltrados);
    this.destruirGraficas();
    setTimeout(() => this.construirGraficas(this.reconocimientosFiltrados), 100);
  }

  calcularMetricas(reconocimientos: any[]) {
    this.totalReconocimientos = reconocimientos.length;
    this.tipoMasFrecuente = this.moda(reconocimientos.map(r => r.tipoReconocimiento));
    this.institucionMasFrecuente = this.moda(reconocimientos.map(r => r.institucion));
    this.egresadosConReconocimiento = new Set(reconocimientos.map(r => r.matricula)).size;
  }

  moda(arr: string[]): string {
    const conteo: Record<string, number> = {};
    arr.filter(Boolean).forEach(v => conteo[v] = (conteo[v] || 0) + 1);
    return Object.keys(conteo).length > 0
      ? Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b)
      : 'N/A';
  }

  descargarGrafica(canvasId: string, nombreArchivo: string): void {
    descargarGraficaPorId(canvasId, nombreArchivo);
  }

  async descargarTodas(): Promise<void> {
    if (this.descargandoTodas) {
      return;
    }
    this.descargandoTodas = true;
    try {
      await descargarGraficasZip(this.graficasDescarga, 'reportes-reconocimientos.zip');
    } finally {
      this.descargandoTodas = false;
    }
  }

  private normalizar(valor: any): string {
    return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  construirGraficas(reconocimientos: any[]) {
    const V1 = '#2f8f83';
    const V2 = '#52b0a4';
    const V3 = '#85cdc6';
    const G1 = '#9eaab3';
    const AZ = '#1a6e78';

    // 1. Tipo de reconocimiento - pie grande
    const tipos = [...ETIQUETAS_TIPO_RECONOCIMIENTO];
    const datosTipo = tipos.map(t =>
      reconocimientos.filter(r => this.normalizar(r.tipoReconocimiento) === this.normalizar(t)).length
    );
    const canvas1 = document.getElementById('chartTipo') as HTMLCanvasElement;
    if (canvas1) {
      const chart = new Chart(canvas1, {
        type: 'pie',
        data: { labels: tipos, datasets: [{ data: datosTipo, backgroundColor: [V1, V2, V3] }] },
        options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
      this.charts.push(chart);
    }

    // 2. Reconocimientos por institución - bar horizontal
    const instituciones = [...new Set(reconocimientos.map(r => r.institucion).filter(Boolean))];
    const datosInst = instituciones.map(i =>
      reconocimientos.filter(r => r.institucion === i).length
    );
    const canvas2 = document.getElementById('chartInstitucion') as HTMLCanvasElement;
    if (canvas2) {
      const chart = new Chart(canvas2, {
        type: 'bar',
        data: {
          labels: instituciones,
          datasets: [{ label: 'Reconocimientos', data: datosInst, backgroundColor: [V1, V2, V3, AZ, G1, V1, V2] }]
        },
        options: {
          indexAxis: 'y',
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
      this.charts.push(chart);
    }
  }

  destruirGraficas() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  ngOnDestroy() {
    this.destruirGraficas();
  }
}