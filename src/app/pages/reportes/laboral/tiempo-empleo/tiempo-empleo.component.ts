import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { contarPorCampo, ETIQUETAS_TIEMPO_EMPLEO, coloresGrafica } from '../../../../utils/graficas-reporte.util';
import { descargarGraficaPdfPorId } from '../../../../utils/descarga-graficas.util';
import { opcionesGraficaBarraVertical } from '../../../../utils/graficas-chart-options.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-tiempo-empleo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tiempo-empleo.component.html',
  styleUrl: './tiempo-empleo.component.css'
})
export class TiempoEmpleoComponent implements OnInit, OnDestroy {
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
    const labels = [...ETIQUETAS_TIEMPO_EMPLEO];
    const values = contarPorCampo(datos, 'tiempoConseguir', ETIQUETAS_TIEMPO_EMPLEO);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data: values, backgroundColor: coloresGrafica(labels.length) }] },
      options: opcionesGraficaBarraVertical()
    });
  }

  async descargar(): Promise<void> {
    await descargarGraficaPdfPorId('chart', 'Tiempo para conseguir empleo', 'tiempo-empleo.pdf', 'Cuánto tiempo tardaron los egresados en obtener su primer empleo');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}