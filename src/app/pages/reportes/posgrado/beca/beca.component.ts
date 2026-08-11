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
      options: opcionesGraficaCircular(total)
    });
  }

  async descargar(): Promise<void> {
    await descargarGraficaPdfPorId('chart', '¿Tiene beca?', 'beca-posgrado.pdf', 'Egresados con y sin beca de posgrado');
  }

  destruir() { this.chart?.destroy(); }
  ngOnDestroy() { this.destruir(); }
}