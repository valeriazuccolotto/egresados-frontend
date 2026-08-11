import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { contarPorCampo, ETIQUETAS_TIPO_TITULACION, coloresGrafica } from '../../../../utils/graficas-reporte.util';
import { descargarGraficaPdfPorId } from '../../../../utils/descarga-graficas.util';
import { opcionesGraficaCircular, opcionesGraficaBarraVertical, opcionesGraficaBarraHorizontal } from '../../../../utils/graficas-chart-options.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-tipo-titulacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo-titulacion.component.html',
  styleUrl: './tipo-titulacion.component.css'
})
export class TipoTitulacionComponent implements OnInit, OnDestroy {
  campus = ['Todos','Loma Bonita','Tuxtepec'];
  campusSeleccionado = 'Todos';
  egresados: any[] = [];
  todos: any[] = [];
  private chart?: Chart;

  constructor(private svc: GraficasDataService) {}

  ngOnInit() {
    this.svc.getEgresados().subscribe(e => {
      this.egresados = e;
      this.svc.getAcademicos().subscribe(a => { this.todos = a; this.construir(); });
    });
  }

  cambiar() { this.destruir(); setTimeout(() => this.construir(), 100); }

  construir() {
    const datos = this.svc.filtrarPorCampus(this.todos, this.egresados, this.campusSeleccionado);
    const labels = [...ETIQUETAS_TIPO_TITULACION];
    const values = contarPorCampo(datos, 'tipoTitulacion', ETIQUETAS_TIPO_TITULACION);
    const total = values.reduce((a,b) => a+b, 0);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: coloresGrafica(labels.length) }] },
      options: opcionesGraficaCircular(total)
    });
  }

  async descargar(): Promise<void> {
    await descargarGraficaPdfPorId('chart', 'Tipo de titulación', 'tipo-titulacion.pdf', 'Modalidad con la que los egresados obtuvieron su título');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}