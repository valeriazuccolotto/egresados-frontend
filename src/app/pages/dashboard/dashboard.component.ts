import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { forkJoin } from 'rxjs';
import { GraficasDataService } from '../../services/graficas-data.service';
import { CarreraService } from '../../services/carrera.service';
import { Carrera } from '../../models/carrera';
import { repararTextoEnObjeto } from '../../utils/texto-encoding.util';
import { laboralesActualesPorMatricula } from '../../utils/laboral-actual.util';
import {
  ETIQUETAS_SECTOR_LABORAL,
  ETIQUETAS_TIEMPO_EMPLEO,
  contarPorCampo,
  normalizarTextoReporte,
  PALETA_GRAFICAS
} from '../../utils/graficas-reporte.util';
import {
  descargarGraficaPdfPorId,
  descargarGraficasPdf,
  GraficaDescarga,
  OpcionDescargaPdf
} from '../../utils/descarga-graficas.util';
import { SelectorDescargaPdfComponent } from '../../components/selector-descarga-pdf/selector-descarga-pdf.component';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorDescargaPdfComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];
  campusSeleccionado = 'Todos';

  egresados: any[] = [];
  academicos: any[] = [];
  laborales: any[] = [];
  posgrados: any[] = [];
  certificaciones: any[] = [];
  carreras: Carrera[] = [];

  totalEgresados = 0;
  tasaEmpleabilidad = '0%';
  trabajanEnArea = '0%';
  conCertificaciones = 0;

  egresadosRecientes: any[] = [];

  descargandoTodas = false;
  mostrarSelectorPdf = false;

  readonly graficasDescarga: GraficaDescarga[] = [
    {
      canvasId: 'g1',
      nombreArchivo: 'empleabilidad-por-carrera.pdf',
      titulo: 'Empleabilidad por carrera',
      descripcion: 'Porcentaje de egresados empleados por carrera'
    },
    {
      canvasId: 'g2',
      nombreArchivo: 'sectores-laborales.pdf',
      titulo: 'Sectores laborales',
      descripcion: 'Distribución por sector de trabajo'
    },
    {
      canvasId: 'g3',
      nombreArchivo: 'tiempo-empleo-por-carrera.pdf',
      titulo: 'Tiempo para conseguir empleo por carrera',
      descripcion: 'Desglose por carrera y rango de tiempo'
    },
    {
      canvasId: 'g4',
      nombreArchivo: 'titulacion-por-carrera.pdf',
      titulo: 'Titulación por carrera',
      descripcion: 'Titulados vs no titulados por carrera'
    },
    {
      canvasId: 'g5',
      nombreArchivo: 'posgrados-por-programa.pdf',
      titulo: 'Egresados con posgrado por programa',
      descripcion: 'Cantidad de egresados con posgrado por programa'
    },
    {
      canvasId: 'g6',
      nombreArchivo: 'certificaciones-por-carrera.pdf',
      titulo: 'Certificaciones por carrera',
      descripcion: 'Egresados con al menos una certificación'
    }
  ];

  readonly opcionesPdf: OpcionDescargaPdf[] = this.graficasDescarga.map(g => ({
    id: g.canvasId,
    titulo: g.titulo,
    descripcion: g.descripcion
  }));

  private charts: Chart[] = [];

  constructor(
    private svc: GraficasDataService,
    private carreraService: CarreraService
  ) {}

  ngOnInit() {
    forkJoin({
      egresados: this.svc.getEgresados(),
      academicos: this.svc.getAcademicos(),
      laborales: this.svc.getLaborales(),
      posgrados: this.svc.getPosgrados(),
      certificaciones: this.svc.getCertificaciones(),
      carreras: this.carreraService.getCarreras()
    }).subscribe({
      next: ({ egresados, academicos, laborales, posgrados, certificaciones, carreras }) => {
        this.egresados = (egresados || []).map(item => repararTextoEnObjeto(item));
        this.academicos = (academicos || []).map(item => repararTextoEnObjeto(item));
        this.laborales = (laborales || []).map(item => repararTextoEnObjeto(item));
        this.posgrados = (posgrados || []).map(item => repararTextoEnObjeto(item));
        this.certificaciones = (certificaciones || []).map(item => repararTextoEnObjeto(item));
        this.carreras = (carreras || [])
          .map(item => repararTextoEnObjeto(item))
          .sort((a, b) => (a.nombreCarrera || '').localeCompare(b.nombreCarrera || '', 'es'));
        this.calcularMetricas();
        setTimeout(() => this.construirGraficas(), 100);
      }
    });
  }

  cambiarCampus() {
    this.destruirGraficas();
    this.calcularMetricas();
    setTimeout(() => this.construirGraficas(), 100);
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
      await descargarGraficasPdf(seleccionadas, 'dashboard-metricas.pdf');
      this.mostrarSelectorPdf = false;
    } finally {
      this.descargandoTodas = false;
    }
  }

  async descargarGrafica(
    canvasId: string,
    titulo: string,
    nombreArchivo: string,
    descripcion?: string
  ): Promise<void> {
    await descargarGraficaPdfPorId(canvasId, titulo, nombreArchivo, descripcion);
  }

  private egresadosFiltrados(): any[] {
    if (this.campusSeleccionado === 'Todos') {
      return this.egresados;
    }
    return this.egresados.filter(e => e.campus === this.campusSeleccionado);
  }

  private matriculasFiltradas(): Set<string> {
    return new Set(this.egresadosFiltrados().map(e => e.matricula));
  }

  private filtrar(lista: any[]): any[] {
    const mats = this.matriculasFiltradas();
    return lista.filter(d => mats.has(d.matricula));
  }

  /** Carreras presentes en académicos del campus (orden del catálogo). */
  private carrerasConDatos(acFilt: any[]): Carrera[] {
    const clavesConDatos = new Set(
      acFilt.map(a => a.carrera?.claveCarrera).filter(Boolean)
    );
    const delCatalogo = this.carreras.filter(c => clavesConDatos.has(c.claveCarrera));
    if (delCatalogo.length) {
      return delCatalogo;
    }
    // Respaldo si el catálogo aún no cargó: usar lo que venga en académicos
    const unicas = new Map<string, Carrera>();
    for (const a of acFilt) {
      const clave = a.carrera?.claveCarrera;
      if (!clave || unicas.has(clave)) {
        continue;
      }
      unicas.set(clave, {
        claveCarrera: clave,
        nombreCarrera: a.carrera?.nombreCarrera || clave
      });
    }
    return Array.from(unicas.values());
  }

  private etiquetaCortaCarrera(carrera: Carrera): string {
    const nombre = (carrera.nombreCarrera || carrera.claveCarrera || '').trim();
    return nombre
      .replace(/^Ingenier[ií]a en\s+/i, '')
      .replace(/^Ingenier[ií]a\s+/i, '')
      .replace(/^Licenciatura en\s+/i, '')
      .replace(/^Licenciatura\s+/i, '');
  }

  private esTitulado(valor: unknown): boolean {
    return normalizarTextoReporte(valor) === 'si';
  }

  private esNoTitulado(valor: unknown): boolean {
    return normalizarTextoReporte(valor) === 'no';
  }

  private relacionConArea(valor: unknown): boolean {
    const n = normalizarTextoReporte(valor);
    return n === 'totalmente relacionada' || n === 'parcialmente relacionada';
  }

  /** Un tiempo por matrícula (respuesta única de inserción laboral). */
  private tiempoPorMatricula(laborales: any[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const lab of laborales) {
      const matricula = lab?.matricula;
      const tiempo = (lab?.tiempoConseguir || '').toString().trim();
      if (!matricula || !tiempo || map.has(matricula)) {
        continue;
      }
      map.set(matricula, tiempo);
    }
    return map;
  }

  private colores(cantidad: number): string[] {
    return Array.from({ length: cantidad }, (_, i) =>
      PALETA_GRAFICAS[i % PALETA_GRAFICAS.length]
    );
  }

  calcularMetricas() {
    const egFilt = this.egresadosFiltrados();
    this.totalEgresados = egFilt.length;

    const labFilt = this.filtrar(this.laborales);
    const labActuales = laboralesActualesPorMatricula(labFilt);
    const matsEmpleados = new Set(labActuales.map(l => l.matricula));

    this.tasaEmpleabilidad = egFilt.length > 0
      ? `${Math.round((matsEmpleados.size / egFilt.length) * 100)}%`
      : '0%';

    const relacionados = labActuales.filter(l => this.relacionConArea(l.relacionCarrera)).length;
    this.trabajanEnArea = labActuales.length > 0
      ? `${Math.round((relacionados / labActuales.length) * 100)}%`
      : '0%';

    const certFilt = this.filtrar(this.certificaciones);
    this.conCertificaciones = new Set(certFilt.map(c => c.matricula)).size;

    this.egresadosRecientes = egFilt.slice(-5).reverse().map(e => {
      const acad = this.academicos.find(a => a.matricula === e.matricula);
      const lab = labActuales.find(l => l.matricula === e.matricula)
        || this.laborales.find(l => l.matricula === e.matricula);
      return {
        nombre: `${e.nombre || ''} ${e.apellidoPaterno || ''}`.trim(),
        carrera: acad?.carrera?.nombreCarrera || '—',
        empresa: lab?.empresa || '—',
        generacion: e.generacion || '—'
      };
    });
  }

  construirGraficas() {
    this.grafica1_EmpleabilidadPorCarrera();
    this.grafica2_SectoresLaborales();
    this.grafica3_TiempoEmpleo();
    this.grafica4_TitulacionPorCarrera();
    this.grafica5_PosgradosPorPrograma();
    this.grafica6_CertificacionesPorCarrera();
  }

  grafica1_EmpleabilidadPorCarrera() {
    const canvas = document.getElementById('g1') as HTMLCanvasElement;
    if (!canvas) return;

    const labFilt = laboralesActualesPorMatricula(this.filtrar(this.laborales));
    const acFilt = this.filtrar(this.academicos);
    const matsEmpleados = new Set(labFilt.map(l => l.matricula));
    const carreras = this.carrerasConDatos(acFilt);
    const labels = carreras.map(c => this.etiquetaCortaCarrera(c));
    const values = carreras.map(c => {
      const matsCarrera = [...new Set(
        acFilt
          .filter(a => a.carrera?.claveCarrera === c.claveCarrera)
          .map(a => a.matricula)
          .filter(Boolean)
      )];
      if (!matsCarrera.length) {
        return 0;
      }
      const empleados = matsCarrera.filter(m => matsEmpleados.has(m)).length;
      return Math.round((empleados / matsCarrera.length) * 100);
    });

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: this.colores(labels.length) }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#333',
            font: { size: 12, weight: 'bold' },
            formatter: (v: number) => v === 0 ? '' : `${v}%`
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: (v: any) => `${v}%` }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  grafica2_SectoresLaborales() {
    const canvas = document.getElementById('g2') as HTMLCanvasElement;
    if (!canvas) return;

    const labFilt = laboralesActualesPorMatricula(this.filtrar(this.laborales));
    const labels = [...ETIQUETAS_SECTOR_LABORAL];
    const values = contarPorCampo(labFilt, 'sector', labels);
    const total = values.reduce((a, b) => a + b, 0);

    const chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: this.colores(labels.length) }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { enabled: false },
          datalabels: {
            color: '#fff',
            font: { size: 11, weight: 'bold' },
            formatter: (v: number) => {
              if (total === 0 || v === 0) return '';
              return `${v}\n(${((v / total) * 100).toFixed(0)}%)`;
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  grafica3_TiempoEmpleo() {
    const canvas = document.getElementById('g3') as HTMLCanvasElement;
    if (!canvas) return;

    const acFilt = this.filtrar(this.academicos);
    const tiemposMap = this.tiempoPorMatricula(this.filtrar(this.laborales));
    const carreras = this.carrerasConDatos(acFilt);
    const tiempos = [...ETIQUETAS_TIEMPO_EMPLEO];
    const colores = this.colores(tiempos.length);

    const datasets = tiempos.map((tiempo, i) => ({
      label: tiempo,
      backgroundColor: colores[i],
      data: carreras.map(c => {
        const matsCarrera = new Set(
          acFilt
            .filter(a => a.carrera?.claveCarrera === c.claveCarrera)
            .map(a => a.matricula)
        );
        let count = 0;
        for (const [matricula, valor] of tiemposMap) {
          if (
            matsCarrera.has(matricula)
            && normalizarTextoReporte(valor) === normalizarTextoReporte(tiempo)
          ) {
            count++;
          }
        }
        return count;
      })
    }));

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: carreras.map(c => this.etiquetaCortaCarrera(c)),
        datasets
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { enabled: true },
          datalabels: { display: false }
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this.charts.push(chart);
  }

  grafica4_TitulacionPorCarrera() {
    const canvas = document.getElementById('g4') as HTMLCanvasElement;
    if (!canvas) return;

    const acFilt = this.filtrar(this.academicos);
    const carreras = this.carrerasConDatos(acFilt);

    const datasets = [
      {
        label: 'Titulados',
        backgroundColor: '#2f8f83',
        data: carreras.map(c =>
          acFilt.filter(a =>
            a.carrera?.claveCarrera === c.claveCarrera && this.esTitulado(a.titulado)
          ).length
        )
      },
      {
        label: 'No titulados',
        backgroundColor: '#9eaab3',
        data: carreras.map(c =>
          acFilt.filter(a =>
            a.carrera?.claveCarrera === c.claveCarrera && this.esNoTitulado(a.titulado)
          ).length
        )
      }
    ];

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: carreras.map(c => this.etiquetaCortaCarrera(c)),
        datasets
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { enabled: true },
          datalabels: { display: false }
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
    this.charts.push(chart);
  }

  grafica5_PosgradosPorPrograma() {
    const canvas = document.getElementById('g5') as HTMLCanvasElement;
    if (!canvas) return;

    const pgFilt = this.filtrar(this.posgrados);
    const conteo = new Map<string, number>();
    for (const p of pgFilt) {
      const programa = (p.nombrePrograma || '').toString().trim() || 'Sin programa';
      conteo.set(programa, (conteo.get(programa) || 0) + 1);
    }

    const entradas = [...conteo.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'));
    const labels = entradas.map(([nombre]) => nombre);
    const values = entradas.map(([, n]) => n);

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Sin datos'],
        datasets: [{
          data: labels.length ? values : [0],
          backgroundColor: this.colores(Math.max(labels.length, 1))
        }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#333',
            font: { size: 12, weight: 'bold' },
            formatter: (v: number) => v === 0 ? '' : v
          }
        },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this.charts.push(chart);
  }

  grafica6_CertificacionesPorCarrera() {
    const canvas = document.getElementById('g6') as HTMLCanvasElement;
    if (!canvas) return;

    const certFilt = this.filtrar(this.certificaciones);
    const acFilt = this.filtrar(this.academicos);
    const carreras = this.carrerasConDatos(acFilt);
    const labels = carreras.map(c => this.etiquetaCortaCarrera(c));
    const values = carreras.map(c => {
      const mats = new Set(
        acFilt
          .filter(a => a.carrera?.claveCarrera === c.claveCarrera)
          .map(a => a.matricula)
      );
      return new Set(
        certFilt.filter(cert => mats.has(cert.matricula)).map(cert => cert.matricula)
      ).size;
    });

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Con certificación',
          data: values,
          backgroundColor: this.colores(labels.length)
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
            font: { size: 12, weight: 'bold' },
            formatter: (v: number) => v === 0 ? '' : v
          }
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
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
