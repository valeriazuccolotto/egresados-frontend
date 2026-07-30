import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { PosgradoService } from '../../../../services/posgrado.service';
import { coloresPrestaciones } from '../../../../utils/prestaciones-reporte.util';
import { datosGraficaTipoBeca } from '../../../../utils/tipo-beca-reporte.util';
import { descargarGraficaPorId } from '../../../../utils/descarga-graficas.util';
import { repararTextoEnObjeto } from '../../../../utils/texto-encoding.util';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-tipo-beca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo-beca.component.html',
  styleUrl: './tipo-beca.component.css'
})
export class TipoBecaComponent implements OnInit, OnDestroy {
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];
  campusSeleccionado = 'Todos';
  egresados: any[] = [];
  todos: any[] = [];
  catalogoTiposBeca: any[] = [];
  private chart?: Chart;

  constructor(
    private svc: GraficasDataService,
    private posgradoService: PosgradoService
  ) {}

  ngOnInit() {
    this.posgradoService.getTiposBeca().subscribe({
      next: (tipos) => {
        this.catalogoTiposBeca = (tipos || []).map(item => repararTextoEnObjeto(item));
        this.construir();
      },
      error: () => {
        this.catalogoTiposBeca = [];
        this.construir();
      }
    });

    this.svc.getEgresados().subscribe(e => {
      this.egresados = (e || []).map(item => repararTextoEnObjeto(item));
      this.svc.getPosgrados().subscribe(p => {
        this.todos = (p || []).map(item => repararTextoEnObjeto(item));
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
    const { labels, values } = datosGraficaTipoBeca(this.catalogoTiposBeca, datos);
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

  descargar(): void {
    descargarGraficaPorId('chart', 'tipo-beca.png');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}
