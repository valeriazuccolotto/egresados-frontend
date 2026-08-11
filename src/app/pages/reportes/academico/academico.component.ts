import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicoService } from '../../../services/academico.service';
import {
  ETIQUETAS_TIPO_TITULACION,
  ETIQUETAS_TIPO_TITULACION_CORTAS
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  opcionesGraficaBarraHorizontal,
  opcionesGraficaBarraVertical,
  opcionesGraficaCircular
} from '../../../utils/graficas-chart-options.util';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-academico',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorDescargaPdfComponent],
  templateUrl: './academico.component.html',
  styleUrl: './academico.component.css'
})
export class AcademicoComponent implements OnInit, AfterViewInit, OnDestroy {

  campusSeleccionado = 'Todos';
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];

  todosAcademicos: any[] = [];
  todosEgresados: any[] = [];

  // Métricas
  totalEncuestados = 0;
  porcentajeTitulados = 0;
  titulacionMasFrecuente = '';
  anioEgresoMasFrecuente = 0;

  descargandoTodas = false;
  mostrarSelectorPdf = false;

  readonly graficasDescarga: GraficaDescarga[] = [
    {
      canvasId: 'chartTitulado',
      nombreArchivo: 'titulados.pdf',
      titulo: '¿Está titulado?',
      descripcion: 'Porcentaje de egresados titulados vs no titulados'
    },
    {
      canvasId: 'chartTipoTitulacion',
      nombreArchivo: 'tipo-titulacion.pdf',
      titulo: 'Tipo de titulación',
      descripcion: 'Modalidad con la que obtuvieron su título'
    },
    {
      canvasId: 'chartAnioEgreso',
      nombreArchivo: 'anio-egreso.pdf',
      titulo: 'Año de egreso',
      descripcion: 'Distribución de egresados por año de egreso'
    },
    {
      canvasId: 'chartCarrera',
      nombreArchivo: 'egresados-por-carrera.pdf',
      titulo: 'Egresados por carrera',
      descripcion: 'Cantidad de egresados registrados por carrera'
    }
  ];

  readonly opcionesPdf: OpcionDescargaPdf[] = this.graficasDescarga.map(g => ({
    id: g.canvasId,
    titulo: g.titulo,
    descripcion: g.descripcion
  }));

  private charts: Chart[] = [];

  constructor(private academicoService: AcademicoService) {}

  ngOnInit() {
    this.academicoService.getEgresados().subscribe({
      next: (egresados) => {
        this.todosEgresados = (egresados || []).map(item => repararTextoEnObjeto(item));
        this.academicoService.getAcademicos().subscribe({
          next: (academicos) => {
            this.todosAcademicos = (academicos || []).map(item => repararTextoEnObjeto(item));
            this.aplicarFiltro();
          },
          error: () => {
            this.todosAcademicos = [];
            this.aplicarFiltro();
          }
        });
      },
      error: () => {
        this.todosEgresados = [];
        this.todosAcademicos = [];
        this.aplicarFiltro();
      }
    });
  }

  ngAfterViewInit() {}

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

    const academicos = this.todosAcademicos.filter(a =>
      matriculasFiltradas.has(a.matricula)
    );

    this.calcularMetricas(academicos);
    this.destruirGraficas();
    setTimeout(() => this.construirGraficas(academicos), 100);
  }

  calcularMetricas(academicos: any[]) {
    this.totalEncuestados = academicos.length;

    const titulados = academicos.filter(a => a.titulado === 'Si').length;
    this.porcentajeTitulados = this.totalEncuestados > 0
      ? Math.round((titulados / this.totalEncuestados) * 100) : 0;

    // Tipo titulación más frecuente
    const conteoTipo: Record<string, number> = {};
    academicos.forEach(a => {
      if (a.tipoTitulacion) {
        conteoTipo[a.tipoTitulacion] = (conteoTipo[a.tipoTitulacion] || 0) + 1;
      }
    });
    this.titulacionMasFrecuente = Object.keys(conteoTipo).length > 0
      ? Object.keys(conteoTipo).reduce((a, b) => conteoTipo[a] > conteoTipo[b] ? a : b)
      : 'N/A';

    // Año egreso más frecuente
    const conteoAnio: Record<number, number> = {};
    academicos.forEach(a => {
      if (a.anioEgreso) {
        conteoAnio[a.anioEgreso] = (conteoAnio[a.anioEgreso] || 0) + 1;
      }
    });
    this.anioEgresoMasFrecuente = Object.keys(conteoAnio).length > 0
      ? Number(Object.keys(conteoAnio).reduce((a, b) =>
          conteoAnio[Number(a)] > conteoAnio[Number(b)] ? a : b))
      : 0;
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
      await new Promise<void>(resolve => setTimeout(resolve, 50));
      await descargarGraficasPdf(seleccionadas, 'reportes-academico.pdf');
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
      .replace(/_/g, ' ')
      .toLowerCase()
      .trim();
  }

  construirGraficas(academicos: any[]) {
    const V1 = '#2f8f83';
    const V2 = '#52b0a4';
    const V3 = '#85cdc6';
    const G1 = '#9eaab3';
    const G2 = '#c8d0d5';
    const AZ = '#1a6e78';

    // 1. Titulado - pie
    const siTitulado = academicos.filter(a => a.titulado === 'Si').length;
    const noTitulado = academicos.filter(a => a.titulado === 'No').length;
    this.crearGrafica('chartTitulado', 'pie',
      ['Sí', 'No'],
      [siTitulado, noTitulado],
      [V1, G1]
    );

    // 2. Tipo titulación - doughnut
    const tipos = [...ETIQUETAS_TIPO_TITULACION];
    const tiposLabels = [...ETIQUETAS_TIPO_TITULACION_CORTAS];
    const datosTipo = tipos.map(t =>
      academicos.filter(a => this.normalizar(a.tipoTitulacion) === this.normalizar(t)).length
    );
    this.crearGrafica('chartTipoTitulacion', 'doughnut',
      tiposLabels, datosTipo, [V1, V2, V3, AZ]
    );

    // 3. Año de egreso - bar
    const anios = [...new Set(academicos.map(a => a.anioEgreso))]
      .filter(Boolean).sort();
    const datosAnio = anios.map(anio =>
      academicos.filter(a => a.anioEgreso === anio).length
    );
    this.crearGraficaBar('chartAnioEgreso',
      anios.map(String), datosAnio,
      [V1, V2, V3, AZ, G1, G2]
    );

    // 4. Carrera - bar horizontal
    const carreras = [...new Set(academicos
      .map(a => a.carrera?.nombreCarrera).filter(Boolean))];
    const datosCarrera = carreras.map(c =>
      academicos.filter(a => a.carrera?.nombreCarrera === c).length
    );
    this.crearGraficaBarH('chartCarrera',
      carreras, datosCarrera, [V1, V2, V3, AZ, G1, G2, V1, V2]
    );
  }

  crearGrafica(id: string, tipo: 'pie' | 'doughnut', labels: string[], data: number[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const total = data.reduce((a, b) => a + b, 0);
    const chart = new Chart(canvas, {
      type: tipo,
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: opcionesGraficaCircular(total)
    });
    this.charts.push(chart);
  }

  crearGraficaBar(id: string, labels: string[], data: number[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: opcionesGraficaBarraVertical()
    });
    this.charts.push(chart);
  }

  crearGraficaBarH(id: string, labels: string[], data: number[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: opcionesGraficaBarraHorizontal()
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