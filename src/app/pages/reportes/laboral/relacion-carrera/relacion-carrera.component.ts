import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { contarPorCampo, ETIQUETAS_RELACION_CARRERA_LABORAL, coloresGrafica } from '../../../../utils/graficas-reporte.util';
import { descargarGraficaPdfPorId } from '../../../../utils/descarga-graficas.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-relacion-carrera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relacion-carrera.component.html',
  styleUrl: './relacion-carrera.component.css'
})
export class RelacionCarreraComponent implements OnInit, OnDestroy {
  campus = ['Todos','Loma Bonita','Tuxtepec'];
  campusSeleccionado = 'Todos';
  egresados: any[] = [];
  todos: any[] = [];
  private chart?: Chart;

  constructor(private svc: GraficasDataService) {}

  ngOnInit() {
    this.svc.getEgresados().subscribe(e => {
      this.egresados = e;
      this.svc.getLaborales().subscribe(l => { this.todos = l; this.construir(); });
    });
  }

  cambiar() { this.destruir(); setTimeout(() => this.construir(), 100); }

  construir() {
    const datos = this.svc.filtrarPorCampus(this.todos, this.egresados, this.campusSeleccionado);
    const labels = [...ETIQUETAS_RELACION_CARRERA_LABORAL];
    const values = contarPorCampo(datos, 'relacionCarrera', ETIQUETAS_RELACION_CARRERA_LABORAL);
    const total = values.reduce((a,b) => a+b, 0);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: coloresGrafica(labels.length) }] },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 13 } } },
          tooltip: { enabled: false },
          datalabels: {
            color: '#fff',
            font: { size: 13, weight: 'bold' },
            formatter: (value: number) => {
              if (total === 0 || value === 0) return '';
              return `${value}\n(${((value/total)*100).toFixed(1)}%)`;
            }
          }
        }
      }
    });
  }

  async descargar(): Promise<void> {
    await descargarGraficaPdfPorId('chart', 'Relación con la carrera', 'relacion-carrera-laboral.pdf', 'Qué tan relacionado está el trabajo con la carrera del egresado');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}