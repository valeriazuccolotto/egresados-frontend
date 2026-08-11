import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { EgresadoService } from '../../services/egresado.service';
import { PerfilService } from '../../services/perfil.service';
import { ValidacionCampo, ValidacionCampoService } from '../../services/validacion-campo.service';
import { BtnValidarCampoComponent } from '../../components/btn-validar-campo/btn-validar-campo.component';
import { repararTextoEnObjeto } from '../../utils/texto-encoding.util';

@Component({
  selector: 'app-datos-recuperados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BtnValidarCampoComponent
  ],
  templateUrl: './datos-recuperados.component.html',
  styleUrls: ['./datos-recuperados.component.css']
})
export class DatosRecuperadosComponent implements OnInit, OnDestroy {

  // =========================
  // BÚSQUEDA
  // =========================
  matricula: string = '';
  resultado: any = null;
  cargando: boolean = false;
  private egresadosCatalogo: any[] = [];
  private egresadosBaseFiltrados: any[] = [];

  // =========================
  // FILTROS
  // =========================
  campusSeleccionado = 'Todos';
  carreraSeleccionada = '';
  generacionSeleccionada = '';

  carrerasFiltradas: string[] = [];

  egresadosFiltrados: any[] = [];

  generaciones: string[] = [
    '2019 - 2023',
    '2020 - 2024',
    '2021 - 2025',
    '2022 - 2026'
  ];

  // =========================
  // MODAL DETALLE
  // =========================
  mostrarModalDetalle = false;
  cargandoDetalle = false;
  detalleEgresado: any = null;
  seccionActiva:
    | 'general'
    | 'contacto'
    | 'academico'
    | 'laboral'
    | 'posgrado'
    | 'reconocimientos'
    | 'certificaciones' = 'general';

  laboralSeleccionado: any = null;
  posgradoSeleccionado: any = null;
  reconocimientoSeleccionado: any = null;
  certificacionSeleccionada: any = null;

  validaciones = new Map<string, ValidacionCampo>();
  validandoCampo: string | null = null;
  matriculaDetalle = '';

  // =========================
  // CONSTRUCTOR
  // =========================
  constructor(
    private egresadoService: EgresadoService,
    public perfilService: PerfilService,
    private validacionCampoService: ValidacionCampoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.actualizarCarreras();
    this.filtrar();
    this.cargarCatalogoBusqueda();

    const matriculaParam = this.route.snapshot.queryParamMap.get('matricula');
    if (matriculaParam?.trim()) {
      this.matricula = matriculaParam.trim();
      this.abrirDetalleEgresado(this.matricula);
      this.matricula = '';
    }
  }

  // =========================
  // CARRERAS
  // =========================
  carrerasPorCampus: any = {
    'Loma Bonita': [
      'Ingeniería en Agronomía',
      'Ingeniería Agrícola Tropical',
      'Ingeniería en Ciencia de Datos',
      'Ingeniería en Computación',
      'Ingeniería en Diseño',
      'Ingeniería en Mecatrónica'
    ],
    'Tuxtepec': [
      'Licenciatura en Medicina',
      'Licenciatura en Enfermería',
      'Químico Farmacobiólogo',
      'Ingeniería en Biotecnología'
    ]
  };

  actualizarCarreras(): void {
    this.carreraSeleccionada = '';

    if (this.campusSeleccionado === 'Todos') {
      this.carrerasFiltradas = [
        ...this.carrerasPorCampus['Loma Bonita'],
        ...this.carrerasPorCampus['Tuxtepec']
      ];
      return;
    }

    this.carrerasFiltradas =
      this.carrerasPorCampus[this.campusSeleccionado] || [];
  }

  onCampusChange(): void {
    this.actualizarCarreras();
    this.filtrar();
  }

  // =========================
  // BUSCAR MATRÍCULA
  // =========================
  onBusquedaInput(): void {
    this.resultado = null;
    this.aplicarBusquedaEnLista();
  }

  buscarPorMatricula(): void {
    const texto = this.matricula.trim();

    if (!texto) {
      this.resultado = null;
      this.matricula = '';
      this.filtrar();
      return;
    }

    const terminoNormalizado = this.normalizarTexto(texto);
    const egresadoPorMatricula = this.egresadosCatalogo.find(
      egresado => this.normalizarTexto(egresado?.matricula) === terminoNormalizado
    );

    this.matricula = '';

    if (!egresadoPorMatricula) {
      this.resultado = null;
      this.cargando = false;
      return;
    }

    this.egresadosFiltrados = [];
    this.cargando = true;
    this.egresadoService.getPerfilCompleto(egresadoPorMatricula.matricula)
      .subscribe({
        next: (data) => {
          this.resultado = repararTextoEnObjeto(data);
          this.cargando = false;
        },
        error: () => {
          this.resultado = null;
          this.cargando = false;
        }
      });
  }

  private cargarCatalogoBusqueda(): void {
    this.egresadoService.getVistaUsuarios().subscribe({
      next: (data) => {
        this.egresadosCatalogo = (data || [])
          .filter((egresado: any) => !!egresado?.matricula)
          .map((egresado: any) => repararTextoEnObjeto(egresado));
      },
      error: () => {
        this.egresadosCatalogo = [];
      }
    });
  }

  nombreCompleto(egresado: any): string {
    return [
      egresado?.nombre,
      egresado?.apellidoPaterno,
      egresado?.apellidoMaterno
    ].filter(Boolean).join(' ');
  }

  private aplicarBusquedaEnLista(): void {
    const termino = this.normalizarTexto(this.matricula);
    this.egresadosFiltrados = !termino
      ? [...this.egresadosBaseFiltrados]
      : this.egresadosBaseFiltrados.filter(
          egresado => this.coincideBusqueda(egresado, termino)
        );
  }

  private coincideBusqueda(egresado: any, terminoNormalizado: string): boolean {
    const matricula = this.normalizarTexto(egresado?.matricula);
    const nombre = this.normalizarTexto(this.nombreCompleto(egresado));
    return matricula.includes(terminoNormalizado) || nombre.includes(terminoNormalizado);
  }

  private normalizarTexto(valor: unknown): string {
    return String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  // =========================
  // FILTROS
  // =========================
  filtrar(): void {

    this.resultado = null;
    this.cargando = true;

    this.egresadoService.filtrarEgresados(
      this.campusSeleccionado,
      this.carreraSeleccionada,
      this.generacionSeleccionada
    ).subscribe({
      next: (data) => {
        this.egresadosBaseFiltrados = (data || [])
          .map(item => repararTextoEnObjeto(item));
        this.aplicarBusquedaEnLista();
        this.cargando = false;
      },
      error: () => {
        this.egresadosBaseFiltrados = [];
        this.egresadosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  // =========================
  // 🔥 CONTACTO (CLICK EN LISTA)
  // =========================
  abrirContacto(egresado: any): void {
    this.abrirDetalleEgresado(egresado?.matricula);
  }

  abrirDetalleEgresado(matricula: string): void {
    const m = this.perfilService.normalizarMatricula(matricula);
    if (!m) {
      return;
    }

    this.mostrarModalDetalle = true;
    this.cargandoDetalle = true;
    this.seccionActiva = 'general';
    this.detalleEgresado = null;
    this.matriculaDetalle = m;
    this.validaciones.clear();
    this.laboralSeleccionado = null;
    this.posgradoSeleccionado = null;
    this.reconocimientoSeleccionado = null;
    this.certificacionSeleccionada = null;

    forkJoin({
      perfil: this.egresadoService.getPerfilCompleto(m).pipe(catchError(() => of(null))),
      contacto: this.egresadoService.getContactoPorMatricula(m).pipe(catchError(() => of(null))),
      academico: this.egresadoService.getAcademicoPorMatricula(m).pipe(catchError(() => of(null))),
      laboral: this.egresadoService.getLaboralPorMatricula(m).pipe(catchError(() => of([]))),
      posgrado: this.egresadoService.getPosgradoPorMatricula(m).pipe(catchError(() => of([]))),
      reconocimientos: this.egresadoService.getReconocimientosPorMatricula(m).pipe(catchError(() => of([]))),
      certificaciones: this.egresadoService.getCertificacionesPorMatricula(m).pipe(catchError(() => of([]))),
      validaciones: this.validacionCampoService.listar(m).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ perfil, contacto, academico, laboral, posgrado, reconocimientos, certificaciones, validaciones }) => {
        const combinado = {
          ...(perfil || {}),
          contacto,
          academico,
          laboral,
          posgrado,
          reconocimientos,
          certificaciones
        };
        this.detalleEgresado = this.normalizarPerfilResponse(repararTextoEnObjeto(combinado));
        this.cargarValidaciones(validaciones);
        // Solo abrir detalle por defecto cuando hay exactamente un registro; si hay varios, el usuario elige cuál ver.
        this.laboralSeleccionado =
          this.laborales.length === 1 ? this.laborales[0] : null;
        this.posgradoSeleccionado =
          this.posgrados.length === 1 ? this.posgrados[0] : null;
        this.reconocimientoSeleccionado =
          this.reconocimientos.length === 1 ? this.reconocimientos[0] : null;
        this.certificacionSeleccionada =
          this.certificaciones.length === 1 ? this.certificaciones[0] : null;
        this.cargandoDetalle = false;
      },
      error: () => {
        this.detalleEgresado = null;
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarContacto(): void {
    this.mostrarModalDetalle = false;
    this.detalleEgresado = null;
    this.laboralSeleccionado = null;
    this.posgradoSeleccionado = null;
    this.reconocimientoSeleccionado = null;
    this.certificacionSeleccionada = null;
    this.seccionActiva = 'general';
    this.matriculaDetalle = '';
    this.validaciones.clear();
  }

  ngOnDestroy(): void {}

  toggleSeccion(seccion: 'general' | 'contacto' | 'academico' | 'laboral' | 'posgrado' | 'reconocimientos' | 'certificaciones'): void {
    this.seccionActiva = this.seccionActiva === seccion ? 'general' : seccion;
  }

  claveValidacion(seccion: string, campo: string, referenciaId?: string | number | null): string {
    const ref = referenciaId != null && referenciaId !== '' ? String(referenciaId) : '';
    return `${seccion}:${campo}:${ref}`;
  }

  estaValidado(seccion: string, campo: string, referenciaId?: string | number | null): boolean {
    return this.validaciones.get(this.claveValidacion(seccion, campo, referenciaId))?.validado ?? false;
  }

  estaValidando(seccion: string, campo: string, referenciaId?: string | number | null): boolean {
    return this.validandoCampo === this.claveValidacion(seccion, campo, referenciaId);
  }

  obtenerValorValidado(seccion: string, campo: string, referenciaId?: string | number | null): string {
    return this.validaciones.get(this.claveValidacion(seccion, campo, referenciaId))?.valorValidado ?? '';
  }

  validarCampo(
    seccion: string,
    campo: string,
    referenciaId?: string | number | null
  ): void {
    const valorActual = this.getValorCampo(seccion, campo, referenciaId);
    if (!this.matriculaDetalle || !this.tieneDato(valorActual)) {
      return;
    }

    const clave = this.claveValidacion(seccion, campo, referenciaId);
    const ref = referenciaId != null && referenciaId !== '' ? String(referenciaId) : undefined;
    this.validandoCampo = clave;

    this.validacionCampoService.validar(this.matriculaDetalle, {
      seccion,
      campo,
      referenciaId: ref,
      validadoPor: this.obtenerAdminSesion(),
      valorValidado: this.normalizarValorValidacion(valorActual)
    }).subscribe({
      next: (validacion) => {
        this.validaciones.set(clave, validacion);
        this.validandoCampo = null;
      },
      error: () => {
        this.validandoCampo = null;
      }
    });
  }

  getValorCampo(seccion: string, campo: string, referenciaId?: string | number | null): string {
    const ref = referenciaId != null && referenciaId !== '' ? String(referenciaId) : '';

    if (seccion === 'general') {
      const mapa: Record<string, unknown> = {
        matricula: this.detalleEgresado?.matricula || this.matriculaDetalle,
        campus: this.detalleEgresado?.campus,
        carrera: this.detalleEgresado?.carrera || this.academico?.claveCarrera,
        generacion: this.detalleEgresado?.generacion
      };
      return this.normalizarValorValidacion(mapa[campo]);
    }

    if (seccion === 'academico') {
      return this.normalizarValorValidacion(this.academico?.[campo]);
    }

    if (seccion === 'laboral' && this.laboralSeleccionado) {
      if (campo === 'prestaciones') {
        return this.normalizarValorValidacion(this.obtenerPrestaciones(this.laboralSeleccionado));
      }
      return this.normalizarValorValidacion(this.laboralSeleccionado[campo]);
    }

    if (seccion === 'posgrado' && this.posgradoSeleccionado) {
      if (campo === 'tiposBeca') {
        return this.normalizarValorValidacion(this.obtenerBecas(this.posgradoSeleccionado));
      }
      if (campo === 'tieneBeca') {
        return this.normalizarValorValidacion(this.posgradoSeleccionado.tieneBeca ? 'Sí' : 'No');
      }
      return this.normalizarValorValidacion(this.posgradoSeleccionado[campo]);
    }

    if (seccion === 'reconocimientos' && this.reconocimientoSeleccionado) {
      return this.normalizarValorValidacion(this.reconocimientoSeleccionado[campo]);
    }

    if (seccion === 'certificaciones' && this.certificacionSeleccionada) {
      return this.normalizarValorValidacion(this.certificacionSeleccionada[campo]);
    }

    return ref;
  }

  private tieneDato(valor: unknown): boolean {
    const texto = this.normalizarValorValidacion(valor);
    if (!texto) {
      return false;
    }
    const vacios = new Set([
      'no registrado',
      'no registrada',
      'sin comentarios',
      'no aplica',
      'no cuenta con prestaciones',
      'sin carrera registrada'
    ]);
    return !vacios.has(texto.toLowerCase());
  }

  private normalizarValorValidacion(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '';
    }
    return String(valor).trim();
  }

  private cargarValidaciones(validaciones: ValidacionCampo[]): void {
    this.validaciones.clear();
    for (const validacion of validaciones || []) {
      this.validaciones.set(
        this.claveValidacion(validacion.seccion, validacion.campo, validacion.referenciaId),
        validacion
      );
    }
  }

  private obtenerAdminSesion(): string {
    const raw = sessionStorage.getItem('usuario');
    if (!raw) {
      return 'admin';
    }
    try {
      const usuario = JSON.parse(raw);
      return usuario?.matricula || usuario?.nombre || 'admin';
    } catch {
      return 'admin';
    }
  }

  refLaboral(): string | undefined {
    return this.laboralSeleccionado?.idLaboral != null
      ? String(this.laboralSeleccionado.idLaboral)
      : undefined;
  }

  refPosgrado(): string | undefined {
    return this.posgradoSeleccionado?.idPosgrado != null
      ? String(this.posgradoSeleccionado.idPosgrado)
      : undefined;
  }

  refReconocimiento(): string | undefined {
    return this.reconocimientoSeleccionado?.idReconocimiento != null
      ? String(this.reconocimientoSeleccionado.idReconocimiento)
      : undefined;
  }

  refCertificacion(): string | undefined {
    return this.certificacionSeleccionada?.idCertificacion != null
      ? String(this.certificacionSeleccionada.idCertificacion)
      : undefined;
  }

  // =========================
  // HELPERS DE DATOS
  // =========================
  get contacto(): any {
    return this.detalleEgresado?.contacto || this.detalleEgresado || {};
  }

  get academico(): any {
    return this.detalleEgresado?.academico || {};
  }

  get laborales(): any[] {
    return this.detalleEgresado?.laboral || this.detalleEgresado?.laborales || [];
  }

  get posgrados(): any[] {
    return this.detalleEgresado?.posgrado || this.detalleEgresado?.posgrados || [];
  }

  get reconocimientos(): any[] {
    return this.detalleEgresado?.reconocimientos || [];
  }

  get certificaciones(): any[] {
    return this.detalleEgresado?.certificaciones || [];
  }

  seleccionarLaboral(item: any): void {
    this.laboralSeleccionado = item;
  }

  seleccionarPosgrado(item: any): void {
    this.posgradoSeleccionado = item;
  }

  seleccionarReconocimiento(item: any): void {
    this.reconocimientoSeleccionado = item;
  }

  seleccionarCertificacion(item: any): void {
    this.certificacionSeleccionada = item;
  }

  private nombresSeparadosPorComa(items: any[]): string {
    if (!items?.length) {
      return '';
    }
    return items
      .map((item: any) => {
        if (typeof item === 'string') {
          return item.trim();
        }
        return (item?.nombre ?? item?.nombrePrestacion ?? '').trim();
      })
      .filter((nombre: string) => !!nombre)
      .join(', ');
  }

  obtenerPrestaciones(laboral: any): string {
    const texto = this.nombresSeparadosPorComa(laboral?.prestaciones ?? []);
    return texto || 'No cuenta con prestaciones';
  }

  urlFotoResultado(egresado: any): string {
    return this.perfilService.resolverUrlFoto(egresado?.urlFoto);
  }

  obtenerBecas(posgrado: any): string {
    if (!posgrado?.tieneBeca) {
      return 'No aplica';
    }
    const desdeLista = this.nombresSeparadosPorComa(posgrado?.tiposBeca ?? []);
    if (desdeLista) {
      return desdeLista;
    }
    const legacy = posgrado?.tipoBeca?.nombre?.trim();
    return legacy || 'No aplica';
  }

  // =========================
  // NORMALIZACION BACKEND
  // =========================
  private normalizarPerfilResponse(raw: any): any {
    const perfil = raw?.perfil || raw?.egresado || raw || {};
    const contactoRaw = raw?.contacto || perfil?.contacto || perfil || {};
    const academicoRaw = raw?.academico || raw?.datosAcademicos || perfil?.academico || {};

    const laboralRaw = this.obtenerLista(raw, ['laboral', 'laborales', 'experienciaLaboral']);
    const posgradoRaw = this.obtenerLista(raw, ['posgrado', 'posgrados', 'estudiosPosgrado']);
    const reconocimientosRaw = this.obtenerLista(raw, ['reconocimientos', 'reconocimiento']);
    const certificacionesRaw = this.obtenerLista(raw, ['certificaciones', 'certificacion']);

    return {
      matricula: this.pick(perfil, ['matricula']) || this.pick(raw, ['matricula']),
      nombre: this.pick(perfil, ['nombre']),
      apellidoPaterno: this.pick(perfil, ['apellidoPaterno', 'apellido_paterno']),
      apellidoMaterno: this.pick(perfil, ['apellidoMaterno', 'apellido_materno']),
      campus: this.pick(perfil, ['campus']),
      generacion: this.pick(perfil, ['generacion']),
      carrera: this.pick(perfil, ['carrera']),
      contacto: {
        telefono: this.pick(contactoRaw, ['telefono', 'telefonoCelular', 'celular']),
        correoPersonal: this.pick(contactoRaw, ['correoPersonal', 'correo_personal', 'correo', 'email']),
        ciudad: this.pick(contactoRaw, ['ciudad']),
        estadoResidencia: this.pick(contactoRaw, ['estadoResidencia', 'estado_residencia', 'estado']),
        instagram: this.pick(contactoRaw, ['instagram']),
        facebook: this.pick(contactoRaw, ['facebook'])
      },
      academico: {
        claveCarrera: this.pick(academicoRaw, ['claveCarrera', 'clave_carrera']),
        carrera: this.pick(academicoRaw, ['carrera', 'nombreCarrera']),
        promedio: this.pick(academicoRaw, ['promedio']),
        anioEgreso: this.pick(academicoRaw, ['anioEgreso', 'anio_egreso']),
        titulado: this.pick(academicoRaw, ['titulado']),
        fechaTitulacion: this.pick(academicoRaw, ['fechaTitulacion', 'fecha_titulacion']),
        tipoTitulacion: this.pick(academicoRaw, ['tipoTitulacion', 'tipo_titulacion']),
        cedulaProfesional: this.pick(academicoRaw, ['cedulaProfesional', 'cedula_profesional']),
        nombreTesis: this.pick(academicoRaw, ['nombreTesis', 'nombre_tesis']),
        director: this.pick(academicoRaw, ['director']),
        codirector: this.pick(academicoRaw, ['codirector']),
        fechaExamen: this.pick(academicoRaw, ['fechaExamen', 'fecha_examen']),
        puntajeCeneval: this.pick(academicoRaw, ['puntajeCeneval', 'puntaje_ceneval']),
        tituloMemoria: this.pick(academicoRaw, ['tituloMemoria', 'titulo_memoria']),
        asesor: this.pick(academicoRaw, ['asesor'])
      },
      laboral: laboralRaw.map((item: any) => ({
        ...item,
        idLaboral: this.pick(item, ['idLaboral', 'id_laboral']),
        empresa: this.pick(item, ['empresa']),
        puesto: this.pick(item, ['puesto']),
        sector: this.pick(item, ['sector']),
        estadoTrabajo: this.pick(item, ['estadoTrabajo', 'estado_trabajo']),
        tipoContrato: this.pick(item, ['tipoContrato', 'tipo_contrato']),
        modalidadTrabajo: this.pick(item, ['modalidadTrabajo', 'modalidad_trabajo']),
        salario: this.pick(item, ['salario']),
        comoConsiguio: this.pick(item, ['comoConsiguio', 'como_consiguio']),
        tiempoConseguir: this.pick(item, ['tiempoConseguir', 'tiempo_conseguir']),
        relacionCarrera: this.pick(item, ['relacionCarrera', 'relacion_carrera']),
        comentarios: this.pick(item, ['comentarios']),
        prestaciones: Array.isArray(item?.prestaciones) ? item.prestaciones : []
      })),
      posgrado: posgradoRaw.map((item: any) => ({
        ...item,
        idPosgrado: this.pick(item, ['idPosgrado', 'id_posgrado']),
        nivelEstudio: this.pick(item, ['nivelEstudio', 'nivel_estudio']),
        institucion: this.pick(item, ['institucion']),
        nombrePrograma: this.pick(item, ['nombrePrograma', 'nombre_programa']),
        modalidad: this.pick(item, ['modalidad']),
        estatus: this.pick(item, ['estatus']),
        relacionadoCarrera: this.pick(item, ['relacionadoCarrera', 'relacionado_carrera']),
        fechaInicio: this.pick(item, ['fechaInicio', 'fecha_inicio']),
        fechaFin: this.pick(item, ['fechaFin', 'fecha_fin']),
        tieneBeca: this.pick(item, ['tieneBeca', 'tiene_beca']),
        tipoBeca: item?.tipoBeca || item?.tipo_beca || null,
        tiposBeca: Array.isArray(item?.tiposBeca)
          ? item.tiposBeca
          : (item?.tipoBeca || item?.tipo_beca ? [item.tipoBeca || item.tipo_beca] : [])
      })),
      reconocimientos: reconocimientosRaw.map((item: any) => ({
        ...item,
        idReconocimiento: this.pick(item, ['idReconocimiento', 'id_reconocimiento']),
        nombreReconocimiento: this.pick(item, ['nombreReconocimiento', 'nombre_reconocimiento']),
        tipoReconocimiento: this.pick(item, ['tipoReconocimiento', 'tipo_reconocimiento']),
        fechaEntrega: this.pick(item, ['fechaEntrega', 'fecha_entrega']),
        institucion: this.pick(item, ['institucion'])
      })),
      certificaciones: certificacionesRaw.map((item: any) => ({
        ...item,
        idCertificacion: this.pick(item, ['idCertificacion', 'id_certificacion']),
        nombreCertificacion: this.pick(item, ['nombreCertificacion', 'nombre_certificacion']),
        institucionCertificacion: this.pick(item, ['institucionCertificacion', 'institucion_certificacion']),
        fechaInicio: this.pick(item, ['fechaInicio', 'fecha_inicio']),
        fechaFin: this.pick(item, ['fechaFin', 'fecha_fin']),
        fechaObtencion: this.pick(item, ['fechaObtencion', 'fecha_obtencion'])
      }))
    };
  }

  private obtenerLista(data: any, keys: string[]): any[] {
    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }
    return [];
  }

  private pick(obj: any, keys: string[]): any {
    for (const key of keys) {
      if (obj?.[key] !== undefined && obj?.[key] !== null) {
        return obj[key];
      }
    }
    return null;
  }

  get estaTitulado(): boolean {
    const valor = String(this.academico?.titulado || '').toLowerCase();
    return valor === 'si' || valor === 'sí';
  }

  get tipoTitulacionNormalizado(): string {
    return String(this.academico?.tipoTitulacion || '').toLowerCase().replace(/\s+/g, '_');
  }

}