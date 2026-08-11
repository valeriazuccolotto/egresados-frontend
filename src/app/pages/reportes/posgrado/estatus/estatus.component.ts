import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { contarPorCampo, ETIQUETAS_ESTATUS_POSGRADO, coloresGrafica } from '../../../../utils/graficas-reporte.util';
import { descargarGraficaPdfPorId } from '../../../../utils/descarga-graficas.util';
import { opcionesGraficaCircular, opcionesGraficaBarraVertical, opcionesGraficaBarraHorizontal } from '../../../../utils/graficas-chart-options.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-estatus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estatus.component.html',
  styleUrl: './estatus.component.css'
})
export class EstatusComponent implements OnInit, OnDestroy {
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
    const labels = [...ETIQUETAS_ESTATUS_POSGRADO];
    const values = contarPorCampo(datos, 'estatus', ETIQUETAS_ESTATUS_POSGRADO);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data: values, backgroundColor: coloresGrafica(labels.length) }] },
      options: opcionesGraficaBarraVertical()
    });
  }

  async descargar(): Promise<void> {
    await descargarGraficaPdfPorId('chart', 'Estatus actual', 'estatus-posgrado.pdf', 'En curso, finalizado o pausado');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}