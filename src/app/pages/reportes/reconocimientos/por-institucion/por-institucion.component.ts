import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../../../services/graficas-data.service';
import { descargarGraficaPdfPorId } from '../../../../utils/descarga-graficas.util';
import { opcionesGraficaCircular, opcionesGraficaBarraVertical, opcionesGraficaBarraHorizontal } from '../../../../utils/graficas-chart-options.util';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-por-institucion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './por-institucion.component.html',
  styleUrl: './por-institucion.component.css'
})
export class PorInstitucionComponent implements OnInit, OnDestroy {
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
    const instituciones = [...new Set(datos.map(r => r.institucion).filter(Boolean))];
    const values = instituciones.map(i => datos.filter(r => r.institucion === i).length);
    const canvas = document.getElementById('chart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: instituciones, datasets: [{ label: 'Reconocimientos', data: values, backgroundColor: ['#2f8f83','#52b0a4','#85cdc6','#1a6e78','#9eaab3','#c8d0d5','#2f8f83','#52b0a4','#1a6e78','#85cdc6'] }] },
      options: opcionesGraficaBarraHorizontal()
    });
  }

  async descargar(): Promise<void> {
    await descargarGraficaPdfPorId('chart', 'Reconocimientos por institución', 'reconocimientos-por-institucion.pdf', 'Instituciones que han otorgado reconocimientos a egresados');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}