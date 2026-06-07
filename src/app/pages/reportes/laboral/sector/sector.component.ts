import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { contarPorCampo, ETIQUETAS_SECTOR_LABORAL, coloresGrafica } from '../../../../utils/graficas-reporte.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-sector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sector.component.html',
  styleUrl: './sector.component.css'
})
export class SectorComponent implements OnInit, OnDestroy {
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
    const labels = [...ETIQUETAS_SECTOR_LABORAL];
    const values = contarPorCampo(datos, 'sector', ETIQUETAS_SECTOR_LABORAL);
    const total = values.reduce((a,b) => a+b, 0);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'pie',
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

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}