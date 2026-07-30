import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { LaboralService } from '../../../../services/laboral.service';
import { coloresPrestaciones, datosGraficaPrestaciones } from '../../../../utils/prestaciones-reporte.util';
import { descargarGraficaPorId } from '../../../../utils/descarga-graficas.util';
import { repararTextoEnObjeto } from '../../../../utils/texto-encoding.util';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-prestaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prestaciones.component.html',
  styleUrl: './prestaciones.component.css'
})
export class PrestacionesComponent implements OnInit, OnDestroy {
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];
  campusSeleccionado = 'Todos';
  egresados: any[] = [];
  todos: any[] = [];
  catalogoPrestaciones: any[] = [];
  private chart?: Chart;

  constructor(
    private svc: GraficasDataService,
    private laboralService: LaboralService
  ) {}

  ngOnInit() {
    this.laboralService.getPrestaciones().subscribe({
      next: (prestaciones) => {
        this.catalogoPrestaciones = (prestaciones || []).map(item => repararTextoEnObjeto(item));
        this.construir();
      },
      error: () => {
        this.catalogoPrestaciones = [];
        this.construir();
      }
    });

    this.svc.getEgresados().subscribe(e => {
      this.egresados = (e || []).map(item => repararTextoEnObjeto(item));
      this.svc.getLaborales().subscribe(l => {
        this.todos = (l || []).map(item => repararTextoEnObjeto(item));
        this.construir();
      });
    });
  }

  cambiar() {
    this.destruir();
    setTimeout(() => this.construir(), 100);
  }

  construir() {
    this.destruir();
    const datos = this.svc.filtrarPorCampus(this.todos, this.egresados, this.campusSeleccionado);
    const { labels, values } = datosGraficaPrestaciones(this.catalogoPrestaciones, datos);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chart = new Chart(canvas, {
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
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#333',
            font: { size: 13, weight: 'bold' },
            formatter: (value: number) => value === 0 ? '' : value
          }
        },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  descargar(): void {
    descargarGraficaPorId('chart', 'prestaciones.png');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}
