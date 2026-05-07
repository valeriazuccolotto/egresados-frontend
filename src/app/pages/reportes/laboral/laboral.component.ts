import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LaboralService } from '../../../services/laboral.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-laboral',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './laboral.component.html',
  styleUrl: './laboral.component.css'
})
export class LaboralComponent implements OnInit, OnDestroy {

  campusSeleccionado = 'Todos';
  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];

  todosLaborales: any[] = [];
  todosEgresados: any[] = [];

  // Métricas
  totalConEmpleo = 0;
  sectorMasFrecuente = '';
  modalidadMasFrecuente = '';
  salarioMasFrecuente = '';

  private charts: Chart[] = [];

  constructor(private laboralService: LaboralService) {}

  ngOnInit() {
    this.laboralService.getEgresados().subscribe(egresados => {
      this.todosEgresados = egresados;
      this.laboralService.getLaborales().subscribe(laborales => {
        this.todosLaborales = laborales;
        this.aplicarFiltro();
      });
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

  construirGraficas(laborales: any[]) {
    const V1 = '#2f8f83';
    const V2 = '#52b0a4';
    const V3 = '#85cdc6';
    const G1 = '#9eaab3';
    const G2 = '#c8d0d5';
    const AZ = '#1a6e78';

    // 1. Sector - pie
    this.crearGraficaPie('chartSector', laborales, 'sector',
      ['Tecnologico','Industria','Agricola','Educacion','Servicios','Otro'],
      [V1, V2, V3, AZ, G1, G2]
    );

    // 2. Cómo consiguió - doughnut
    this.crearGraficaDoughnut('chartComoConsiguio', laborales, 'comoConsiguio',
      ['Bolsa de trabajo','Internet','Recomendacion','Entrevista'],
      [V1, V2, V3, AZ]
    );

    // 3. Tiempo para conseguir - bar
    this.crearGraficaBar('chartTiempo', laborales, 'tiempoConseguir',
      ['Menos de 3 meses','3-6 meses','6-12 meses','Mas de un año'],
      [V1, V2, V3, G1]
    );

    // 4. Tipo contrato - pie
    this.crearGraficaPie('chartContrato', laborales, 'tipoContrato',
      ['Tiempo completo','Freelance'],
      [V1, G1]
    );

    // 5. Modalidad - doughnut
    this.crearGraficaDoughnut('chartModalidad', laborales, 'modalidadTrabajo',
      ['Presencial','Remoto','Hibrido'],
      [V1, V2, V3]
    );

    // 6. Salario - bar
    this.crearGraficaBar('chartSalario', laborales, 'salario',
      ['$5,000 - $12,000','$12,000 - $20,000','$20,000 - $30,000','Más de $30,000','Prefiero no responder'],
      [G2, V3, V2, V1, G1]
    );

    // 7. Relación carrera - doughnut
    this.crearGraficaDoughnut('chartRelacion', laborales, 'relacionCarrera',
      ['Totalmente relacionada','Parcialmente relacionada','Poco relacionada','Totalmente diferente'],
      [V1, V2, V3, G1]
    );

    // 8. Prestaciones - bar horizontal
    this.crearGraficaPrestaciones('chartPrestaciones', laborales, [V1, V2, V3, AZ, G1, G2, V1, V2]);
  }

  crearGraficaPie(id: string, laborales: any[], campo: string, labels: string[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const data = labels.map(l => laborales.filter(x => x[campo] === l).length);
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
    const data = labels.map(l => laborales.filter(x => x[campo] === l).length);
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
    const data = labels.map(l => laborales.filter(x => x[campo] === l).length);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    this.charts.push(chart);
  }

  crearGraficaPrestaciones(id: string, laborales: any[], colors: string[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const nombresPrestaciones = ['IMSS','ISSSTE','Seguro de vida','Fondo de ahorro',
      'Vales de despensa','Aguinaldo','Vacaciones pagadas','Otra'];
    const data = nombresPrestaciones.map(nombre =>
      laborales.filter(l =>
        l.prestaciones && l.prestaciones.some((p: any) => p.nombre === nombre)
      ).length
    );
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: nombresPrestaciones, datasets: [{ label: 'Egresados', data, backgroundColor: colors }] },
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