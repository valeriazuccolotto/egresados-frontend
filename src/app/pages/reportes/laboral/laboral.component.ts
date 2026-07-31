import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LaboralService } from '../../../services/laboral.service';
import { coloresPrestaciones, datosGraficaPrestaciones } from '../../../utils/prestaciones-reporte.util';
import {
  ETIQUETAS_COMO_CONSIGUIO,
  ETIQUETAS_MODALIDAD_LABORAL,
  ETIQUETAS_RELACION_CARRERA_LABORAL,
  ETIQUETAS_SALARIO,
  ETIQUETAS_SECTOR_LABORAL,
  ETIQUETAS_TIEMPO_EMPLEO,
  ETIQUETAS_TIPO_CONTRATO
} from '../../../utils/graficas-reporte.util';
import {
  descargarGraficaPdfPorId,
  descargarGraficasPdf,
  GraficaDescarga,
  OpcionDescargaPdf
} from '../../../utils/descarga-graficas.util';
import { SelectorDescargaPdfComponent } from '../../../components/selector-descarga-pdf/selector-descarga-pdf.component';
import { repararTextoEnObjeto } from '../../../utils/texto-encoding.util';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-laboral',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SelectorDescargaPdfComponent],
  templateUrl: './laboral.component.html',
  styleUrl: './laboral.component.css'
})
export class LaboralComponent implements OnInit, OnDestroy {

  campusSeleccionado = 'Todos';
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];

  todosLaborales: any[] = [];
  todosEgresados: any[] = [];
  catalogoPrestaciones: any[] = [];

  totalConEmpleo = 0;
  sectorMasFrecuente = '';
  modalidadMasFrecuente = '';
  salarioMasFrecuente = '';

  descargandoTodas = false;
  mostrarSelectorPdf = false;

  readonly graficasDescarga: GraficaDescarga[] = [
    {
      canvasId: 'chartSector',
      nombreArchivo: 'sector-laboral.pdf',
      titulo: 'Sector laboral',
      descripcion: 'Distribución de egresados por sector de trabajo'
    },
    {
      canvasId: 'chartComoConsiguio',
      nombreArchivo: 'como-consiguio-empleo.pdf',
      titulo: '¿Cómo consiguió el empleo?',
      descripcion: 'Medio por el que obtuvieron su trabajo actual'
    },
    {
      canvasId: 'chartTiempo',
      nombreArchivo: 'tiempo-empleo.pdf',
      titulo: 'Tiempo para conseguir empleo',
      descripcion: 'Cuánto tiempo tardaron en obtener su primer empleo'
    },
    {
      canvasId: 'chartContrato',
      nombreArchivo: 'tipo-contrato.pdf',
      titulo: 'Tipo de contrato',
      descripcion: 'Modalidad contractual de los egresados empleados'
    },
    {
      canvasId: 'chartModalidad',
      nombreArchivo: 'modalidad-laboral.pdf',
      titulo: 'Modalidad de trabajo',
      descripcion: 'Presencial, remoto o híbrido'
    },
    {
      canvasId: 'chartSalario',
      nombreArchivo: 'rango-salario.pdf',
      titulo: 'Rango salarial',
      descripcion: 'Distribución de egresados por rango de salario mensual'
    },
    {
      canvasId: 'chartRelacion',
      nombreArchivo: 'relacion-carrera-laboral.pdf',
      titulo: 'Relación con la carrera',
      descripcion: 'Qué tan relacionado está el trabajo con su carrera'
    },
    {
      canvasId: 'chartPrestaciones',
      nombreArchivo: 'prestaciones.pdf',
      titulo: 'Prestaciones más comunes',
      descripcion: 'Cuántos egresados cuentan con cada prestación'
    }
  ];

  readonly opcionesPdf: OpcionDescargaPdf[] = this.graficasDescarga.map(g => ({
    id: g.canvasId,
    titulo: g.titulo,
    descripcion: g.descripcion
  }));

  private charts: Chart[] = [];

  constructor(private laboralService: LaboralService) {}

  ngOnInit() {
    this.laboralService.getPrestaciones().subscribe({
      next: (prestaciones) => {
        this.catalogoPrestaciones = (prestaciones || []).map(item => repararTextoEnObjeto(item));
        if (this.todosLaborales.length) {
          this.aplicarFiltro();
        }
      },
      error: () => {
        this.catalogoPrestaciones = [];
        if (this.todosLaborales.length) {
          this.aplicarFiltro();
        }
      }
    });

    this.laboralService.getEgresados().subscribe({
      next: (egresados) => {
        this.todosEgresados = (egresados || []).map((item: any) => repararTextoEnObjeto(item));
        this.laboralService.getLaborales().subscribe({
          next: (laborales) => {
            this.todosLaborales = (laborales || []).map((item: any) => repararTextoEnObjeto(item));
            this.aplicarFiltro();
          },
          error: () => {
            this.todosLaborales = [];
            this.aplicarFiltro();
          }
        });
      },
      error: () => {
        this.todosEgresados = [];
        this.todosLaborales = [];
        this.aplicarFiltro();
      }
    });
  }

  cambiarCampus() {
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    let egresadosFiltrados = this.todosEgresados;

    if (this.campusSeleccionado !== 'Todos') {
      egresadosFiltrados = this.todosEgresados.filter(e =>
        e.campus === this.campusSeleccionado
      );
    }

    const matriculasFiltradas = new Set(egresadosFiltrados.map(e => e.matricula));
    const laborales = this.todosLaborales.filter(l =>
      matriculasFiltradas.has(l.matricula)
    );

    this.calcularMetricas(laborales);
    this.destruirGraficas();
    setTimeout(() => this.construirGraficas(laborales), 100);
  }

  calcularMetricas(laborales: any[]) {
    this.totalConEmpleo = laborales.length;
    this.sectorMasFrecuente = this.moda(laborales.map(l => l.sector));
    this.modalidadMasFrecuente = this.moda(laborales.map(l => l.modalidadTrabajo));
    this.salarioMasFrecuente = this.moda(laborales.map(l => l.salario));
  }

  moda(arr: string[]): string {
    const conteo: Record<string, number> = {};
    arr.filter(Boolean).forEach(v => conteo[v] = (conteo[v] || 0) + 1);
    return Object.keys(conteo).length > 0
      ? Object.keys(conteo).reduce((a, b) => conteo[a] > conteo[b] ? a : b)
      : 'N/A';
  }

  abrirSelectorPdf(): void {
    this.mostrarSelectorPdf = true;
  }

  cerrarSelectorPdf(): void {
    if (!this.descargandoTodas) {
      this.mostrarSelectorPdf = false;
    }
  }

  async onConfirmarDescargaPdf(ids: string[]): Promise<void> {
    const seleccionadas = this.graficasDescarga.filter(g => ids.includes(g.canvasId));
    if (!seleccionadas.length) {
      return;
    }
    this.descargandoTodas = true;
    try {
      // Cedemos el hilo para que el modal muestre "Generando PDF…"
      await new Promise<void>(resolve => setTimeout(resolve, 50));
      await descargarGraficasPdf(seleccionadas, 'reportes-laboral.pdf');
      this.mostrarSelectorPdf = false;
    } finally {
      this.descargandoTodas = false;
    }
  }

  async descargarGrafica(canvasId: string, titulo: string, nombreArchivo: string, descripcion?: string): Promise<void> {
    await descargarGraficaPdfPorId(canvasId, titulo, nombreArchivo, descripcion);
  }

  private normalizar(valor: any): string {
    return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  construirGraficas(laborales: any[]) {
    const V1 = '#2f8f83';
    const V2 = '#52b0a4';
    const V3 = '#85cdc6';
    const G1 = '#9eaab3';
    const G2 = '#c8d0d5';
    const AZ = '#1a6e78';

    this.crearGraficaPie('chartSector', laborales, 'sector',
      [...ETIQUETAS_SECTOR_LABORAL],
      [V1, V2, V3, AZ, G1, G2]
    );

    this.crearGraficaDoughnut('chartComoConsiguio', laborales, 'comoConsiguio',
      [...ETIQUETAS_COMO_CONSIGUIO],
      [V1, V2, V3, AZ]
    );

    this.crearGraficaBar('chartTiempo', laborales, 'tiempoConseguir',
      [...ETIQUETAS_TIEMPO_EMPLEO],
      [V1, V2, V3, G1]
    );

    this.crearGraficaPie('chartContrato', laborales, 'tipoContrato',
      [...ETIQUETAS_TIPO_CONTRATO],
      [V1, G1]
    );

    this.crearGraficaDoughnut('chartModalidad', laborales, 'modalidadTrabajo',
      [...ETIQUETAS_MODALIDAD_LABORAL],
      [V1, V2, V3]
    );

    this.crearGraficaBar('chartSalario', laborales, 'salario',
      [...ETIQUETAS_SALARIO],
      [G2, V3, V2, V1, G1]
    );

    this.crearGraficaDoughnut('chartRelacion', laborales, 'relacionCarrera',
      [...ETIQUETAS_RELACION_CARRERA_LABORAL],
      [V1, V2, V3, G1]
    );

    this.crearGraficaPrestaciones('chartPrestaciones', laborales);
  }

  crearGraficaPie(id: string, laborales: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => laborales.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    this.charts.push(chart);
  }

  crearGraficaDoughnut(id: string, laborales: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => laborales.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    this.charts.push(chart);
  }

  crearGraficaBar(id: string, laborales: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => laborales.filter(x => this.normalizar(x[campo]) === this.normalizar(l)).length);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    this.charts.push(chart);
  }

  crearGraficaPrestaciones(id: string, laborales: any[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;

    const { labels, values } = datosGraficaPrestaciones(this.catalogoPrestaciones, laborales);
    const chart = new Chart(canvas, {
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
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  destruirGraficas() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  ngOnDestroy() {
    this.destruirGraficas();
  }
}
