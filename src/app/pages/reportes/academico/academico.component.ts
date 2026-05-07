import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicoService } from '../../../services/academico.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  private charts: Chart[] = [];

  constructor(private academicoService: AcademicoService) {}

  ngOnInit() {
    this.academicoService.getEgresados().subscribe(egresados => {
      this.todosEgresados = egresados;
      this.academicoService.getAcademicos().subscribe(academicos => {
        this.todosAcademicos = academicos;
        this.aplicarFiltro();
      });
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
    const tipos = ['Tesis', 'CENEVAL', 'Promedio', 'Experiencia_laboral'];
    const tiposLabels = ['Tesis', 'CENEVAL', 'Promedio', 'Exp. Laboral'];
    const datosTipo = tipos.map(t =>
      academicos.filter(a => a.tipoTitulacion === t).length
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

  crearGrafica(id: string, tipo: any, labels: string[], data: number[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: tipo,
      data: { labels, datasets: [{ data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
    this.charts.push(chart);
  }

  crearGraficaBar(id: string, labels: string[], data: number[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    this.charts.push(chart);
  }

  crearGraficaBarH(id: string, labels: string[], data: number[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
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