import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { descargarGraficaPorId } from '../../../../utils/descarga-graficas.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-beca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beca.component.html',
  styleUrl: './beca.component.css'
})
export class BecaComponent implements OnInit, OnDestroy {
  campus = ['Todos','Loma Bonita','Tuxtepec'];
  campusSeleccionado = 'Todos';
  egresados: any[] = [];
  todos: any[] = [];
  private chart?: Chart;

  constructor(private svc: GraficasDataService) {}

  ngOnInit() {
    this.svc.getEgresados().subscribe(e => {
      this.egresados = e;
      this.svc.getPosgrados().subscribe(p => { this.todos = p; this.construir(); });
    });
  }

  cambiar() { this.destruir(); setTimeout(() => this.construir(), 100); }

  construir() {
    const datos = this.svc.filtrarPorCampus(this.todos, this.egresados, this.campusSeleccionado);
    const conBeca = datos.filter(d => d.tieneBeca).length;
    const sinBeca = datos.filter(d => !d.tieneBeca).length;
    const total = conBeca + sinBeca;
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'pie',
      data: { labels: ['Con beca','Sin beca'], datasets: [{ data: [conBeca, sinBeca], backgroundColor: ['#2f8f83','#9eaab3'] }] },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 14 } } },
          tooltip: { enabled: false },
          datalabels: {
            color: '#fff',
            font: { size: 14, weight: 'bold' },
            formatter: (value: number) => {
              if (total === 0 || value === 0) return '';
              return `${value}\n(${((value/total)*100).toFixed(1)}%)`;
            }
          }
        }
      }
    });
  }

  descargar(): void {
    descargarGraficaPorId('chart', 'beca-posgrado.png');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}