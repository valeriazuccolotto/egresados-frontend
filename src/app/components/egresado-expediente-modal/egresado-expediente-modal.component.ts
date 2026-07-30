import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { EgresadoService } from '../../services/egresado.service';
import { PerfilService } from '../../services/perfil.service';
import { repararTextoEnObjeto } from '../../utils/texto-encoding.util';

@Component({
  selector: 'app-egresado-expediente-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './egresado-expediente-modal.component.html',
  styleUrl: './egresado-expediente-modal.component.css'
})
export class EgresadoExpedienteModalComponent implements OnChanges {

  @Input() visible = false;
  @Input() matricula: string | null = null;
  @Output() cerrar = new EventEmitter<void>();

  cargandoDetalle = false;
  detalleEgresado: any = null;
  seccionActiva:
    | 'contacto'
    | 'academico'
    | 'laboral'
    | 'posgrado'
    | 'reconocimientos'
    | 'certificaciones' = 'contacto';

  laboralSeleccionado: any = null;
  posgradoSeleccionado: any = null;
  reconocimientoSeleccionado: any = null;
  certificacionSeleccionada: any = null;

  constructor(
    private egresadoService: EgresadoService,
    private perfilService: PerfilService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['matricula']) {
      if (this.visible && this.matricula) {
        this.cargarExpediente(this.matricula);
      } else if (!this.visible) {
        this.limpiarEstado();
      }
    }
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  toggleSeccion(seccion: typeof this.seccionActiva): void {
    this.seccionActiva = this.seccionActiva === seccion ? 'contacto' : seccion;
  }

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

  get estaTitulado(): boolean {
    const valor = String(this.academico?.titulado || '').toLowerCase();
    return valor === 'si' || valor === 'sí';
  }

  get tipoTitulacionNormalizado(): string {
    return String(this.academico?.tipoTitulacion || '').toLowerCase().replace(/\s+/g, '_');
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

  obtenerPrestaciones(laboral: any): string {
    const texto = this.nombresSeparadosPorComa(laboral?.prestaciones ?? []);
    return texto || 'No cuenta con prestaciones';
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

  private cargarExpediente(matricula: string): void {
    const m = this.perfilService.normalizarMatricula(matricula);
    if (!m) {
      return;
    }

    this.cargandoDetalle = true;
    this.detalleEgresado = null;
    this.seccionActiva = 'contacto';
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
      certificaciones: this.egresadoService.getCertificacionesPorMatricula(m).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ perfil, contacto, academico, laboral, posgrado, reconocimientos, certificaciones }) => {
        this.detalleEgresado = this.normalizarPerfilResponse(repararTextoEnObjeto({
          ...(perfil || {}),
          contacto,
          academico,
          laboral,
          posgrado,
          reconocimientos,
          certificaciones
        }));
        this.laboralSeleccionado = this.laborales.length === 1 ? this.laborales[0] : null;
        this.posgradoSeleccionado = this.posgrados.length === 1 ? this.posgrados[0] : null;
        this.reconocimientoSeleccionado = this.reconocimientos.length === 1 ? this.reconocimientos[0] : null;
        this.certificacionSeleccionada = this.certificaciones.length === 1 ? this.certificaciones[0] : null;
        this.cargandoDetalle = false;
      },
      error: () => {
        this.detalleEgresado = null;
        this.cargandoDetalle = false;
      }
    });
  }

  private limpiarEstado(): void {
    this.detalleEgresado = null;
    this.cargandoDetalle = false;
    this.seccionActiva = 'contacto';
    this.laboralSeleccionado = null;
    this.posgradoSeleccionado = null;
    this.reconocimientoSeleccionado = null;
    this.certificacionSeleccionada = null;
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

  private normalizarPerfilResponse(raw: any): any {
    const perfil = raw?.perfil || raw?.egresado || raw || {};
    const contactoRaw = raw?.contacto || perfil?.contacto || perfil || {};
    const academicoRaw = raw?.academico || raw?.datosAcademicos || perfil?.academico || {};
    const laboralRaw = this.obtenerLista(raw, ['laboral', 'laborales', 'experienciaLaboral']);
    const posgradoRaw = this.obtenerLista(raw, ['posgrado', 'posgrados', 'estudiosPosgrado']);
    const reconocimientosRaw = this.obtenerLista(raw, ['reconocimientos', 'reconocimiento']);
    const certificacionesRaw = this.obtenerLista(raw, ['certificaciones', 'certificacion']);

    return {
      ...perfil,
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
}
