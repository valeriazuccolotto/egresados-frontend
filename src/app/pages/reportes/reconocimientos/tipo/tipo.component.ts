import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { contarPorCampo, ETIQUETAS_TIPO_RECONOCIMIENTO, coloresGrafica } from '../../../../utils/graficas-reporte.util';
import { descargarGraficaPdfPorId } from '../../../../utils/descarga-graficas.util';
import { opcionesGraficaCircular, opcionesGraficaBarraVertical, opcionesGraficaBarraHorizontal } from '../../../../utils/graficas-chart-options.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-tipo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo.component.html',
  styleUrl: './tipo.component.css'
})
export class TipoComponent implements OnInit, OnDestroy {
  campus = ['Todos','Loma Bonita','Tuxtepec'];
  campusSeleccionado = 'Todos';
  egresados: any[] = [];
  todos: any[] = [];
  private chart?: Chart;

  constructor(private svc: GraficasDataService) {}

  ngOnInit() {
    this.svc.getEgresados().subscribe(e => {
      this.egresados = e;
      this.svc.getReconocimientos().subscribe(r => { this.todos = r; this.construir(); });
    });
  }

  cambiar() { this.destruir(); setTimeout(() => this.construir(), 100); }

  construir() {
    const datos = this.svc.filtrarPorCampus(this.todos, this.egresados, this.campusSeleccionado);
    const labels = [...ETIQUETAS_TIPO_RECONOCIMIENTO];
    const values = contarPorCampo(datos, 'tipoReconocimiento', ETIQUETAS_TIPO_RECONOCIMIENTO);
    const total = values.reduce((a,b) => a+b, 0);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'pie',
      data: { labels, datasets: [{ data: values, backgroundColor: coloresGrafica(labels.length) }] },
      options: opcionesGraficaCircular(total)
    });
  }

  async descargar(): Promise<void> {
    await descargarGraficaPdfPorId('chart', 'Tipo de reconocimiento', 'tipo-reconocimiento.pdf', 'Distribución por tipo: académico, cultural o deportivo');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}