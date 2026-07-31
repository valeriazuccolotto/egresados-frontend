import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { contarPorCampo, ETIQUETAS_SALARIO, coloresGrafica } from '../../../../utils/graficas-reporte.util';
import { descargarGraficaPdfPorId } from '../../../../utils/descarga-graficas.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-rango-salario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rango-salario.component.html',
  styleUrl: './rango-salario.component.css'
})
export class RangoSalarioComponent implements OnInit, OnDestroy {
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
    const labels = [...ETIQUETAS_SALARIO];
    const values = contarPorCampo(datos, 'salario', ETIQUETAS_SALARIO);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data: values, backgroundColor: coloresGrafica(labels.length) }] },
      options: {
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
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  async descargar(): Promise<void> {
    await descargarGraficaPdfPorId('chart', 'Rango salarial', 'rango-salario.pdf', 'Distribución de egresados por rango de salario mensual');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}