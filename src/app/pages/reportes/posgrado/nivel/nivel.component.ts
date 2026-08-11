import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { contarPorCampo, ETIQUETAS_NIVEL_POSGRADO, coloresGrafica } from '../../../../utils/graficas-reporte.util';
import { descargarGraficaPdfPorId } from '../../../../utils/descarga-graficas.util';
import { opcionesGraficaCircular, opcionesGraficaBarraVertical, opcionesGraficaBarraHorizontal } from '../../../../utils/graficas-chart-options.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-nivel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nivel.component.html',
  styleUrl: './nivel.component.css'
})
export class NivelComponent implements OnInit, OnDestroy {
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
    const labels = [...ETIQUETAS_NIVEL_POSGRADO];
    const values = contarPorCampo(datos, 'nivelEstudio', ETIQUETAS_NIVEL_POSGRADO);
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
    await descargarGraficaPdfPorId('chart', 'Nivel de estudio', 'nivel-posgrado.pdf', 'Distribución entre maestría y doctorado');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}