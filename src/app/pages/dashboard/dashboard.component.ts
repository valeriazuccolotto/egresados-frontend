import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GraficasDataService } from '../../services/graficas-data.service';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Métricas
  totalEgresados = 0;
  tasaEmpleabilidad = '0%';
  trabajanEnArea = '0%';
  conCertificaciones = 0;

  // Egresados recientes (tabla)
  egresadosRecientes: any[] = [];

  private charts: Chart[] = [];

  // Carreras de licenciatura/ingeniería (abreviadas para la gráfica)
  private carrerasLic = [
    { clave: 'AGR',  nombre: 'Agronomía' },
    { clave: 'DAT',  nombre: 'C. de Datos' },
    { clave: 'COM',  nombre: 'Computación' },
    { clave: 'DIS',  nombre: 'Diseño' },
    { clave: 'MEC',  nombre: 'Mecatrónica' },
    { clave: 'BIO',  nombre: 'Biología' },
    { clave: 'VET',  nombre: 'Veterinaria' },
  ];

  private carrerasPosgrado = [
    { clave: 'MOPT', nombre: 'Optimización' },
    { clave: 'MAGR', nombre: 'P. Agrícola' },
    { clave: 'MPEC', nombre: 'P. Pecuario' },
  ];

  constructor(private svc: GraficasDataService) {}

  ngOnInit() {
    this.svc.getEgresados().subscribe(eg => {
      this.egresados = eg;
      this.svc.getAcademicos().subscribe(ac => {
        this.academicos = ac;
        this.svc.getLaborales().subscribe(lb => {
          this.laborales = lb;
          this.svc.getPosgrados().subscribe(pg => {
            this.posgrados = pg;
            this.svc.getCertificaciones().subscribe(cert => {
              this.certificaciones = cert;
              this.calcularMetricas();
              setTimeout(() => this.construirGraficas(), 100);
            });
          });
        });
      });
    });
  }

  cambiarCampus() {
    this.destruirGraficas();
    this.calcularMetricas();
    setTimeout(() => this.construirGraficas(), 100);
  }

  private egresadosFiltrados(): any[] {
    if (this.campusSeleccionado === 'Todos') return this.egresados;
    return this.egresados.filter(e => e.campus === this.campusSeleccionado);
  }

  private matriculasFiltradas(): Set<string> {
    return new Set(this.egresadosFiltrados().map(e => e.matricula));
  }

  private filtrar(lista: any[]): any[] {
    const mats = this.matriculasFiltradas();
    return lista.filter(d => mats.has(d.matricula));
  }

  calcularMetricas() {
    const egFilt = this.egresadosFiltrados();
    this.totalEgresados = egFilt.length;

    const labFilt = this.filtrar(this.laborales);
    this.tasaEmpleabilidad = egFilt.length > 0
      ? `${Math.round((labFilt.length / egFilt.length) * 100)}%`
      : '0%';

    const relacionados = labFilt.filter(l =>
      l.relacionCarrera === 'Totalmente relacionada' || l.relacionCarrera === 'Parcialmente relacionada'
    ).length;
    this.trabajanEnArea = labFilt.length > 0
      ? `${Math.round((relacionados / labFilt.length) * 100)}%`
      : '0%';

    const certFilt = this.filtrar(this.certificaciones);
    const matriculasConCert = new Set(certFilt.map(c => c.matricula));
    this.conCertificaciones = matriculasConCert.size;

    // Tabla: últimos 5 egresados
    this.egresadosRecientes = egFilt.slice(-5).reverse().map(e => {
      const acad = this.academicos.find(a => a.matricula === e.matricula);
      const lab = this.laborales.find(l => l.matricula === e.matricula);
      return {
        nombre: `${e.nombre} ${e.apellidoPaterno}`,
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
    this.grafica5_PosgradosPorCarrera();
    this.grafica6_CertificacionesPorCarrera();
  }

  // ─── GRÁFICA 1: Empleabilidad por carrera (barras horizontales) ───
  grafica1_EmpleabilidadPorCarrera() {
    const canvas = document.getElementById('g1') as HTMLCanvasElement;
    if (!canvas) return;
    const labFilt = this.filtrar(this.laborales);
    const acFilt  = this.filtrar(this.academicos);
    const labels = this.carrerasLic.map(c => c.nombre);
    const values = this.carrerasLic.map(c => {
      const egresadosCarrera = acFilt.filter(a => a.carrera?.claveCarrera === c.clave).map(a => a.matricula);
      const empleados = labFilt.filter(l => egresadosCarrera.includes(l.matricula)).length;
      return egresadosCarrera.length > 0 ? Math.round((empleados / egresadosCarrera.length) * 100) : 0;
    });
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: ['#2f8f83','#52b0a4','#85cdc6','#1a6e78','#9eaab3','#c8d0d5','#2f8f83'] }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end', align: 'end', color: '#333',
            font: { size: 12, weight: 'bold' },
            formatter: (v: number) => v === 0 ? '' : `${v}%`
          }
        },
        scales: { x: { beginAtZero: true, max: 100, ticks: { callback: (v: any) => `${v}%` } } }
      }
    });
    this.charts.push(chart);
  }

  // ─── GRÁFICA 2: Sectores laborales (pie) ───
  grafica2_SectoresLaborales() {
    const canvas = document.getElementById('g2') as HTMLCanvasElement;
    if (!canvas) return;
    const labFilt = this.filtrar(this.laborales);
    const sectores = ['Tecnologico','Industria','Agricola','Educacion','Servicios','Otro'];
    const values = sectores.map(s => labFilt.filter(l => l.sector === s).length);
    const total = values.reduce((a,b) => a+b, 0);
    const chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: sectores,
        datasets: [{ data: values, backgroundColor: ['#2f8f83','#52b0a4','#85cdc6','#1a6e78','#9eaab3','#c8d0d5'] }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { enabled: false },
          datalabels: {
            color: '#fff', font: { size: 11, weight: 'bold' },
            formatter: (v: number) => {
              if (total === 0 || v === 0) return '';
              return `${v}\n(${((v/total)*100).toFixed(0)}%)`;
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  // ─── GRÁFICA 3: Tiempo para conseguir empleo por carrera (barras agrupadas) ───
  grafica3_TiempoEmpleo() {
    const canvas = document.getElementById('g3') as HTMLCanvasElement;
    if (!canvas) return;
    const labFilt = this.filtrar(this.laborales);
    const acFilt  = this.filtrar(this.academicos);
    const tiempos = ['Menos de 3 meses','3-6 meses','6-12 meses','Mas de un año'];
    const colores = ['#2f8f83','#52b0a4','#85cdc6','#9eaab3'];
    const datasets = tiempos.map((t, i) => ({
      label: t,
      backgroundColor: colores[i],
      data: this.carrerasLic.map(c => {
        const mats = acFilt.filter(a => a.carrera?.claveCarrera === c.clave).map(a => a.matricula);
        return labFilt.filter(l => mats.includes(l.matricula) && l.tiempoConseguir === t).length;
      })
    }));
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: this.carrerasLic.map(c => c.nombre), datasets },
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

  // ─── GRÁFICA 4: Titulación por carrera (barras apiladas) ───
  grafica4_TitulacionPorCarrera() {
    const canvas = document.getElementById('g4') as HTMLCanvasElement;
    if (!canvas) return;
    const acFilt = this.filtrar(this.academicos);
    const datasets = [
      { label: 'Titulados', backgroundColor: '#2f8f83', data: this.carrerasLic.map(c => acFilt.filter(a => a.carrera?.claveCarrera === c.clave && a.titulado === 'Si').length) },
      { label: 'No titulados', backgroundColor: '#9eaab3', data: this.carrerasLic.map(c => acFilt.filter(a => a.carrera?.claveCarrera === c.clave && a.titulado !== 'Si').length) }
    ];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: this.carrerasLic.map(c => c.nombre), datasets },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: { enabled: true },
          datalabels: { display: false }
        },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this.charts.push(chart);
  }

  // ─── GRÁFICA 5: Posgrados por carrera (barras horizontales) ───
  grafica5_PosgradosPorCarrera() {
    const canvas = document.getElementById('g5') as HTMLCanvasElement;
    if (!canvas) return;
    const pgFilt = this.filtrar(this.posgrados);
    const acFilt = this.filtrar(this.academicos);
    const labels = this.carrerasPosgrado.map(c => c.nombre);
    const values = this.carrerasPosgrado.map(c => {
      const mats = acFilt.filter(a => a.carrera?.claveCarrera === c.clave).map(a => a.matricula);
      return pgFilt.filter(p => mats.includes(p.matricula)).length;
    });
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: ['#2f8f83','#52b0a4','#85cdc6'] }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end', align: 'end', color: '#333',
            font: { size: 12, weight: 'bold' },
            formatter: (v: number) => v === 0 ? '' : v
          }
        },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
    this.charts.push(chart);
  }

  // ─── GRÁFICA 6: Certificaciones por carrera (barras) ───
  grafica6_CertificacionesPorCarrera() {
    const canvas = document.getElementById('g6') as HTMLCanvasElement;
    if (!canvas) return;
    const certFilt = this.filtrar(this.certificaciones);
    const acFilt   = this.filtrar(this.academicos);
    const labels = this.carrerasLic.map(c => c.nombre);
    const values = this.carrerasLic.map(c => {
      const mats = acFilt.filter(a => a.carrera?.claveCarrera === c.clave).map(a => a.matricula);
      const matsConCert = new Set(certFilt.filter(cert => mats.includes(cert.matricula)).map(cert => cert.matricula));
      return matsConCert.size;
    });
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Con certificación', data: values, backgroundColor: ['#2f8f83','#52b0a4','#85cdc6','#1a6e78','#9eaab3','#c8d0d5','#2f8f83'] }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end', align: 'end', color: '#333',
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

  ngOnDestroy() { this.destruirGraficas(); }
}