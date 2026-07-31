import { HttpClient } from '@angular/common/http';

import { Component, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { forkJoin } from 'rxjs';

import { Chart, registerables } from 'chart.js';

import { EgresadoExpedienteModalComponent } from '../../../../components/egresado-expediente-modal/egresado-expediente-modal.component';

import { GraficasDataService } from '../../../../services/graficas-data.service';

import { resolverEstadoTrabajo } from '../../../../utils/estados-mexico-coords.util';

import {

  conteoPorEstadoDesdeMarcadores,

  EstadoMapaSvg,

  geoJsonAMapasEstados,

  MexicoGeoCollection

} from '../../../../utils/mexico-geo.util';

import {

  conteoPorMunicipioDesdeMarcadores,

  geoJsonAMapasMunicipios,

  MunicipioMapaSvg,

  OaxacaGeoCollection,

  resolverMunicipioOaxaca

} from '../../../../utils/oaxaca-geo.util';

import { laboralesActualesPorMatricula } from '../../../../utils/laboral-actual.util';

import {
  chartADataUrl,
  datosTablaDesdeChart,
  descargarImagenPdf,
  esperar,
  generarPdfGraficas,
  obtenerChartPorCanvasId,
  OpcionDescargaPdf,
  PaginaPdfGrafica,
  svgADataUrl
} from '../../../../utils/descarga-graficas.util';

import { SelectorDescargaPdfComponent } from '../../../../components/selector-descarga-pdf/selector-descarga-pdf.component';

import { repararTexto } from '../../../../utils/texto-encoding.util';



Chart.register(...registerables);



export type VistaMapaLaboral = 'indice' | 'graficas' | 'top-estados' | 'oaxaca';



export interface EgresadoEnMapa {

  matricula: string;

  nombreCompleto: string;

  campus: string;

  carrera: string;

  empresa: string;

  puesto: string;

  sector: string;

  estadoTrabajo: string;

  municipioTrabajo: string;

  modalidadTrabajo: string;

  salario: string;

  tipoContrato: string;

}



export interface MarcadorMapaLaboral {

  estado: string;

  x: number;

  y: number;

  esExtranjero: boolean;

  egresados: EgresadoEnMapa[];

}



export interface MarcadorMapaMunicipio {

  municipio: string;

  x: number;

  y: number;

  egresados: EgresadoEnMapa[];

}



export interface UbicacionActivaModal {

  etiqueta: string;

  egresados: EgresadoEnMapa[];

  esExtranjero: boolean;

}



@Component({

  selector: 'app-mapa-ubicacion-laboral',

  standalone: true,

  imports: [CommonModule, FormsModule, EgresadoExpedienteModalComponent, SelectorDescargaPdfComponent],

  templateUrl: './mapa-ubicacion.component.html',

  styleUrl: './mapa-ubicacion.component.css'

})

export class MapaUbicacionLaboralComponent implements OnInit, OnDestroy {



  readonly vistas: { id: VistaMapaLaboral; label: string }[] = [

    { id: 'indice', label: 'Índice' },

    { id: 'graficas', label: 'Gráficas de trabajo' },

    { id: 'top-estados', label: 'Estados con más egresados' },

    { id: 'oaxaca', label: 'Oaxaca' }

  ];



  vistaActiva: VistaMapaLaboral = 'indice';

  campusSeleccionado = 'Todos';

  campus = ['Todos', 'Loma Bonita', 'Tuxtepec'];



  cargando = true;

  mapaListo = false;

  sinDatos = false;

  estadosMapa: EstadoMapaSvg[] = [];

  conteoPorEstado: Record<string, number> = {};

  marcadores: MarcadorMapaLaboral[] = [];



  municipiosMapa: MunicipioMapaSvg[] = [];

  marcadoresOaxaca: MarcadorMapaMunicipio[] = [];

  conteoPorMunicipio: Record<string, number> = {};

  oaxacaListo = false;

  cargandoOaxaca = false;

  sinDatosOaxaca = false;

  descargandoVista = false;

  descargandoTodas = false;

  mostrarSelectorPdf = false;



  ubicacionActiva: UbicacionActivaModal | null = null;

  hoverUbicacion: UbicacionActivaModal | null = null;

  mostrarModalLista = false;

  mostrarModalExpediente = false;

  matriculaExpediente: string | null = null;



  private egresados: any[] = [];

  private academicos: any[] = [];

  private laborales: any[] = [];

  private laboralesFiltrados: any[] = [];

  private centroidsPorEstado = new Map<string, { x: number; y: number }>();

  private centroidsPorMunicipio = new Map<string, { x: number; y: number }>();

  private charts: Chart[] = [];



  constructor(

    private graficas: GraficasDataService,

    private http: HttpClient

  ) {}



  ngOnInit(): void {

    forkJoin({

      geo: this.http.get<MexicoGeoCollection>('assets/maps/mexicoLow.json'),

      egresados: this.graficas.getEgresados(),

      academicos: this.graficas.getAcademicos(),

      laborales: this.graficas.getLaborales()

    }).subscribe({

      next: ({ geo, egresados, academicos, laborales }) => {

        this.estadosMapa = geoJsonAMapasEstados(geo);

        this.centroidsPorEstado = new Map(

          this.estadosMapa.map(s => [s.estado, s.centroid])

        );

        this.egresados = egresados || [];

        this.academicos = academicos || [];

        this.laborales = laborales || [];

        this.mapaListo = true;

        this.cargando = false;

        this.aplicarFiltro();

      },

      error: () => {

        this.cargando = false;

        this.sinDatos = true;

      }

    });

  }



  ngOnDestroy(): void {

    this.destruirGraficas();

  }



  cambiarCampus(): void {

    this.cerrarModales();

    this.aplicarFiltro();

  }



  cambiarVista(vista: VistaMapaLaboral): void {

    if (this.vistaActiva === vista) {

      return;

    }

    this.cerrarModales();

    this.vistaActiva = vista;



    if (vista === 'oaxaca' && !this.oaxacaListo && !this.cargandoOaxaca) {

      this.cargarMapaOaxaca();

      return;

    }



    if (vista === 'graficas' || vista === 'top-estados') {

      this.destruirGraficas();

      setTimeout(() => this.construirGraficasVista(), 80);

    }

  }



  aplicarFiltro(): void {

    if (!this.mapaListo) {

      return;

    }

    this.laboralesFiltrados = this.graficas.filtrarPorCampus(

      this.laborales,

      this.egresados,

      this.campusSeleccionado

    );

    this.construirMarcadores(this.laboralesFiltrados);

    if (this.oaxacaListo) {

      this.construirMarcadoresOaxaca(this.laboralesFiltrados);

    }

    if (this.vistaActiva === 'graficas' || this.vistaActiva === 'top-estados') {

      this.destruirGraficas();

      setTimeout(() => this.construirGraficasVista(), 80);

    }

  }



  private cargarMapaOaxaca(): void {

    this.cargandoOaxaca = true;

    this.http.get<OaxacaGeoCollection>('assets/maps/oaxaca-municipios.json').subscribe({

      next: geo => {

        this.municipiosMapa = geoJsonAMapasMunicipios(geo);

        this.centroidsPorMunicipio = new Map(

          this.municipiosMapa.map(m => [m.municipio, m.centroid])

        );

        this.oaxacaListo = true;

        this.cargandoOaxaca = false;

        this.construirMarcadoresOaxaca(this.laboralesFiltrados);

      },

      error: () => {

        this.cargandoOaxaca = false;

        this.sinDatosOaxaca = true;

      }

    });

  }



  private construirMarcadores(laborales: any[]): void {

    const egresadoPorMatricula = new Map(

      this.egresados.map(e => [e.matricula, e])

    );

    const academicoPorMatricula = new Map(

      this.academicos.map(a => [a.matricula, a])

    );



    const laboralesActuales = laboralesActualesPorMatricula(laborales);

    const porEstado = new Map<string, EgresadoEnMapa[]>();



    for (const lab of laboralesActuales) {

      const estadoRaw = lab.estadoTrabajo ?? lab.estado_trabajo;

      const estado = resolverEstadoTrabajo(estadoRaw);

      if (!estado) {

        continue;

      }



      const item = this.crearEgresadoEnMapa(

        lab,

        estado,

        egresadoPorMatricula,

        academicoPorMatricula

      );



      const lista = porEstado.get(estado) ?? [];

      lista.push(item);

      porEstado.set(estado, lista);

    }



    this.marcadores = Array.from(porEstado.entries())

      .map(([estado, egresadosEnEstado]) => {

        const centroid = this.centroidsPorEstado.get(estado);

        if (!centroid && estado !== 'Extranjero') {

          return null;

        }

        const coords =

          estado === 'Extranjero'

            ? { x: 960, y: 325 }

            : centroid!;

        return {

          estado,

          x: coords.x,

          y: coords.y,

          esExtranjero: estado === 'Extranjero',

          egresados: egresadosEnEstado.sort((a, b) =>

            a.nombreCompleto.localeCompare(b.nombreCompleto, 'es')

          )

        } as MarcadorMapaLaboral;

      })

      .filter((m): m is MarcadorMapaLaboral => m !== null)

      .sort((a, b) => a.estado.localeCompare(b.estado, 'es'));



    this.conteoPorEstado = conteoPorEstadoDesdeMarcadores(this.marcadores);

    this.sinDatos = this.marcadores.length === 0;



    if (

      this.ubicacionActiva &&

      this.vistaActiva === 'indice' &&

      !this.marcadores.some(m => m.estado === this.ubicacionActiva!.etiqueta)

    ) {

      this.cerrarModales();

    }

  }



  private construirMarcadoresOaxaca(laborales: any[]): void {

    const egresadoPorMatricula = new Map(

      this.egresados.map(e => [e.matricula, e])

    );

    const academicoPorMatricula = new Map(

      this.academicos.map(a => [a.matricula, a])

    );

    const nombresMunicipios = this.municipiosMapa.map(m => m.municipio);



    const laboralesActuales = laboralesActualesPorMatricula(laborales);

    const porMunicipio = new Map<string, EgresadoEnMapa[]>();



    for (const lab of laboralesActuales) {

      const estadoRaw = lab.estadoTrabajo ?? lab.estado_trabajo;

      const estado = resolverEstadoTrabajo(estadoRaw);

      if (estado !== 'Oaxaca') {

        continue;

      }



      const municipioRaw = lab.municipioTrabajo ?? lab.municipio_trabajo;

      const municipio = resolverMunicipioOaxaca(municipioRaw, nombresMunicipios);

      if (!municipio) {

        continue;

      }



      const item = this.crearEgresadoEnMapa(

        lab,

        estado,

        egresadoPorMatricula,

        academicoPorMatricula,

        municipio

      );



      const lista = porMunicipio.get(municipio) ?? [];

      lista.push(item);

      porMunicipio.set(municipio, lista);

    }



    this.marcadoresOaxaca = Array.from(porMunicipio.entries())

      .map(([municipio, egresadosEnMunicipio]) => {

        const centroid = this.centroidsPorMunicipio.get(municipio);

        if (!centroid) {

          return null;

        }

        return {

          municipio,

          x: centroid.x,

          y: centroid.y,

          egresados: egresadosEnMunicipio.sort((a, b) =>

            a.nombreCompleto.localeCompare(b.nombreCompleto, 'es')

          )

        } as MarcadorMapaMunicipio;

      })

      .filter((m): m is MarcadorMapaMunicipio => m !== null)

      .sort((a, b) => a.municipio.localeCompare(b.municipio, 'es'));



    this.conteoPorMunicipio = conteoPorMunicipioDesdeMarcadores(this.marcadoresOaxaca);

    this.sinDatosOaxaca = this.marcadoresOaxaca.length === 0;



    if (

      this.ubicacionActiva &&

      this.vistaActiva === 'oaxaca' &&

      !this.marcadoresOaxaca.some(m => m.municipio === this.ubicacionActiva!.etiqueta)

    ) {

      this.cerrarModales();

    }

  }



  private crearEgresadoEnMapa(

    lab: any,

    estado: string,

    egresadoPorMatricula: Map<string, any>,

    academicoPorMatricula: Map<string, any>,

    municipioTrabajo = ''

  ): EgresadoEnMapa {

    const eg = egresadoPorMatricula.get(lab.matricula);

    const acad = academicoPorMatricula.get(lab.matricula);

    const nombreCompleto = eg

      ? [eg.nombre, eg.apellidoPaterno, eg.apellidoMaterno].filter(Boolean).join(' ')

      : `Matrícula ${lab.matricula}`;



    const municipio =

      municipioTrabajo ||

      repararTexto(lab.municipioTrabajo ?? lab.municipio_trabajo) ||

      '';



    return {

      matricula: lab.matricula,

      nombreCompleto,

      campus: eg?.campus || '—',

      carrera: repararTexto(

        acad?.carrera?.nombreCarrera ??

        acad?.nombreCarrera ??

        acad?.carrera?.claveCarrera ??

        acad?.claveCarrera ??

        '—'

      ),

      empresa: repararTexto(lab.empresa) || '—',

      puesto: repararTexto(lab.puesto) || '—',

      sector: repararTexto(lab.sector) || '—',

      estadoTrabajo: estado,

      municipioTrabajo: municipio,

      modalidadTrabajo: repararTexto(lab.modalidadTrabajo) || '—',

      salario: repararTexto(lab.salario) || '—',

      tipoContrato: repararTexto(lab.tipoContrato) || '—'

    };

  }



  private datosEstadosOrdenados(): { estado: string; total: number }[] {

    return this.marcadores

      .filter(m => !m.esExtranjero)

      .map(m => ({ estado: m.estado, total: m.egresados.length }))

      .sort((a, b) => b.total - a.total || a.estado.localeCompare(b.estado, 'es'));

  }



  private construirGraficasVista(): void {

    if (this.vistaActiva === 'graficas') {

      this.construirGraficaTodosEstados();

    } else if (this.vistaActiva === 'top-estados') {

      this.construirGraficaTopEstados();

    }

  }



  private construirGraficaTodosEstados(): void {

    const canvas = document.getElementById('chartEstadosTrabajo') as HTMLCanvasElement;

    if (!canvas) {

      return;

    }

    const datos = this.datosEstadosOrdenados().sort((a, b) =>

      a.estado.localeCompare(b.estado, 'es')

    );

    const labels = datos.map(d => d.estado);

    const values = datos.map(d => d.total);

    const chart = new Chart(canvas, {

      type: 'bar',

      data: {

        labels,

        datasets: [{

          label: 'Egresados',

          data: values,

          backgroundColor: labels.map(estado =>

            estado === 'Oaxaca' ? '#f59e0b' : '#2f8f83'

          )

        }]

      },

      options: {

        maintainAspectRatio: false,

        plugins: { legend: { display: false } },

        scales: {

          y: { beginAtZero: true, ticks: { stepSize: 1 } },

          x: { ticks: { maxRotation: 60, minRotation: 45 } }

        }

      }

    });

    this.charts.push(chart);

  }



  private construirGraficaTopEstados(): void {

    const canvas = document.getElementById('chartTopEstados') as HTMLCanvasElement;

    if (!canvas) {

      return;

    }

    const top = this.datosEstadosOrdenados().slice(0, 10);

    const labels = top.map(d => d.estado);

    const values = top.map(d => d.total);

    const chart = new Chart(canvas, {

      type: 'bar',

      data: {

        labels,

        datasets: [{

          label: 'Egresados',

          data: values,

          backgroundColor: labels.map(estado =>

            estado === 'Oaxaca' ? '#f59e0b' : '#52b0a4'

          )

        }]

      },

      options: {

        indexAxis: 'y',

        maintainAspectRatio: false,

        plugins: { legend: { display: false } },

        scales: {

          x: { beginAtZero: true, ticks: { stepSize: 1 } }

        }

      }

    });

    this.charts.push(chart);

  }



  private destruirGraficas(): void {

    this.charts.forEach(c => c.destroy());

    this.charts = [];

  }



  onEstadoHover(estado: string): void {

    if (!this.mostrarModalLista) {

      const marcador = this.marcadores.find(m => m.estado === estado);

      this.hoverUbicacion = marcador

        ? { etiqueta: marcador.estado, egresados: marcador.egresados, esExtranjero: marcador.esExtranjero }

        : null;

    }

  }



  onMunicipioHover(municipio: string): void {

    if (!this.mostrarModalLista) {

      const marcador = this.marcadoresOaxaca.find(m => m.municipio === municipio);

      this.hoverUbicacion = marcador

        ? { etiqueta: marcador.municipio, egresados: marcador.egresados, esExtranjero: false }

        : null;

    }

  }



  onUbicacionLeave(): void {

    this.hoverUbicacion = null;

  }



  onEstadoClick(estado: string, event: Event): void {

    const marcador = this.marcadores.find(m => m.estado === estado);

    if (!marcador) {

      return;

    }

    this.abrirModalLista(marcador.estado, marcador.egresados, marcador.esExtranjero, event);

  }



  onMunicipioClick(municipio: string, event: Event): void {

    const marcador = this.marcadoresOaxaca.find(m => m.municipio === municipio);

    if (!marcador) {

      return;

    }

    this.abrirModalLista(marcador.municipio, marcador.egresados, false, event);

  }



  abrirModalListaMarcador(marcador: MarcadorMapaLaboral, event: Event): void {

    this.abrirModalLista(marcador.estado, marcador.egresados, marcador.esExtranjero, event);

  }



  abrirModalListaMunicipio(marcador: MarcadorMapaMunicipio, event: Event): void {

    this.abrirModalLista(marcador.municipio, marcador.egresados, false, event);

  }



  abrirModalLista(

    etiqueta: string,

    egresados: EgresadoEnMapa[],

    esExtranjero: boolean,

    event: Event

  ): void {

    event.stopPropagation();

    if (this.mostrarModalLista && this.ubicacionActiva?.etiqueta === etiqueta) {

      this.cerrarModalLista();

      return;

    }

    this.ubicacionActiva = { etiqueta, egresados, esExtranjero };

    this.mostrarModalLista = true;

    this.hoverUbicacion = null;

  }



  cerrarModalLista(): void {

    this.mostrarModalLista = false;

    this.ubicacionActiva = null;

  }



  abrirExpediente(eg: EgresadoEnMapa, event: Event): void {

    event.stopPropagation();

    this.matriculaExpediente = eg.matricula;

    this.mostrarModalExpediente = true;

  }



  cerrarModalExpediente(): void {

    this.mostrarModalExpediente = false;

    this.matriculaExpediente = null;

  }



  cerrarModales(): void {

    this.cerrarModalExpediente();

    this.cerrarModalLista();

  }



  esOaxaca(estado: string): boolean {

    return estado === 'Oaxaca';

  }



  pinTransform(x: number, y: number): string {

    return `translate(${x}, ${y})`;

  }



  get marcadoresMexico(): MarcadorMapaLaboral[] {

    return this.marcadores.filter(m => !m.esExtranjero);

  }



  get marcadorExtranjero(): MarcadorMapaLaboral | null {

    return this.marcadores.find(m => m.esExtranjero) ?? null;

  }



  private readonly tituloVistaPdf: Record<VistaMapaLaboral, string> = {
    indice: 'Mapa de ubicación laboral (México)',
    graficas: 'Egresados por estado de trabajo',
    'top-estados': 'Estados con más egresados',
    oaxaca: 'Mapa de Oaxaca por municipio'
  };

  private readonly nombreArchivoPdfVista: Record<VistaMapaLaboral, string> = {
    indice: 'mapa-ubicacion-mexico.pdf',
    graficas: 'mapa-egresados-por-estado.pdf',
    'top-estados': 'mapa-top-estados.pdf',
    oaxaca: 'mapa-oaxaca-municipios.pdf'
  };

  readonly opcionesPdf: OpcionDescargaPdf[] = this.vistas.map(v => ({
    id: v.id,
    titulo: this.tituloVistaPdf[v.id]
  }));

  abrirSelectorPdf(): void {
    if (this.descargandoVista || this.descargandoTodas) {
      return;
    }
    this.mostrarSelectorPdf = true;
  }

  cerrarSelectorPdf(): void {
    if (!this.descargandoTodas) {
      this.mostrarSelectorPdf = false;
    }
  }

  async descargarVistaActual(): Promise<void> {
    if (this.descargandoVista || this.descargandoTodas) {
      return;
    }
    this.descargandoVista = true;
    try {
      const pagina = await this.capturarPaginaVista(this.vistaActiva);
      if (pagina) {
        await descargarImagenPdf(
          pagina.imagenDataUrl,
          pagina.titulo,
          this.nombreArchivoPdfVista[this.vistaActiva],
          pagina.descripcion,
          pagina.filas
        );
      }
    } finally {
      this.descargandoVista = false;
    }
  }

  async onConfirmarDescargaPdf(ids: string[]): Promise<void> {
    const vistasSeleccionadas = this.vistas.filter(v => ids.includes(v.id));
    if (!vistasSeleccionadas.length) {
      return;
    }

    this.descargandoTodas = true;
    const vistaOriginal = this.vistaActiva;
    const paginas: PaginaPdfGrafica[] = [];

    try {
      for (const vista of vistasSeleccionadas) {
        this.cambiarVistaForzada(vista.id);
        await esperar(vista.id === 'oaxaca' ? 700 : 350);
        if (vista.id === 'oaxaca') {
          await this.esperarOaxacaListo(4000);
        }
        const pagina = await this.capturarPaginaVista(vista.id);
        if (pagina) {
          paginas.push(pagina);
        }
      }
      await generarPdfGraficas(paginas, 'mapa-ubicacion-laboral.pdf');
      this.mostrarSelectorPdf = false;
    } finally {
      this.cambiarVistaForzada(vistaOriginal);
      this.descargandoTodas = false;
    }
  }

  private cambiarVistaForzada(vista: VistaMapaLaboral): void {
    this.cerrarModales();
    this.vistaActiva = vista;

    if (vista === 'oaxaca' && !this.oaxacaListo && !this.cargandoOaxaca) {
      this.cargarMapaOaxaca();
    }

    if (vista === 'graficas' || vista === 'top-estados') {
      this.destruirGraficas();
      setTimeout(() => this.construirGraficasVista(), 80);
    }
  }

  private async esperarOaxacaListo(timeoutMs: number): Promise<void> {
    const inicio = Date.now();
    while (!this.oaxacaListo && Date.now() - inicio < timeoutMs) {
      if (!this.cargandoOaxaca && this.sinDatosOaxaca) {
        break;
      }
      await esperar(120);
    }
  }

  private filasDesdeConteo(conteo: Record<string, number>): PaginaPdfGrafica['filas'] {
    const entradas = Object.entries(conteo);
    const total = entradas.reduce((acumulado, [, valor]) => acumulado + valor, 0);
    return entradas
      .sort((a, b) => b[1] - a[1])
      .map(([etiqueta, valor]) => ({
        etiqueta,
        valor,
        porcentaje: total > 0 ? (valor / total) * 100 : 0
      }));
  }

  private async capturarPaginaVista(vista: VistaMapaLaboral): Promise<PaginaPdfGrafica | null> {
    switch (vista) {
      case 'graficas': {
        const chart = obtenerChartPorCanvasId('chartEstadosTrabajo');
        if (!chart) {
          return null;
        }
        return {
          titulo: this.tituloVistaPdf.graficas,
          descripcion: 'Distribución según el campus seleccionado',
          imagenDataUrl: chartADataUrl(chart),
          filas: datosTablaDesdeChart(chart)
        };
      }
      case 'top-estados': {
        const chart = obtenerChartPorCanvasId('chartTopEstados');
        if (!chart) {
          return null;
        }
        return {
          titulo: this.tituloVistaPdf['top-estados'],
          descripcion: 'Distribución según el campus seleccionado',
          imagenDataUrl: chartADataUrl(chart),
          filas: datosTablaDesdeChart(chart)
        };
      }
      case 'oaxaca': {
        const svg = document.querySelector('.pagina-mapa .mapa-contenedor .mapa-svg') as SVGSVGElement | null;
        if (!svg) {
          return null;
        }
        return {
          titulo: this.tituloVistaPdf.oaxaca,
          descripcion: 'Egresados laborando en cada municipio de Oaxaca',
          imagenDataUrl: await svgADataUrl(svg),
          filas: this.filasDesdeConteo(this.conteoPorMunicipio)
        };
      }
      default: {
        const svg = document.querySelector('.pagina-mapa .mapa-contenedor .mapa-svg') as SVGSVGElement | null;
        if (!svg) {
          return null;
        }
        return {
          titulo: this.tituloVistaPdf.indice,
          descripcion: 'Egresados laborando por estado de la República Mexicana',
          imagenDataUrl: await svgADataUrl(svg),
          filas: this.filasDesdeConteo(this.conteoPorEstado)
        };
      }
    }
  }

  get tituloVista(): string {

    switch (this.vistaActiva) {

      case 'graficas':

        return 'Egresados por estado de trabajo';

      case 'top-estados':

        return 'Estados con más egresados';

      case 'oaxaca':

        return 'Mapa de Oaxaca por municipio';

      default:

        return 'Mapa de ubicación laboral';

    }

  }



  get subtituloVista(): string {

    switch (this.vistaActiva) {

      case 'graficas':

      case 'top-estados':

        return 'Distribución según el campus seleccionado';

      case 'oaxaca':

        return 'Pasa el cursor para ver la cantidad · Clic para ver egresados';

      default:

        return 'Pasa el cursor para ver la cantidad · Clic para ver egresados';

    }

  }

}

