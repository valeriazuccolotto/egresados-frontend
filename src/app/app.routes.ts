import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DatosRecuperadosComponent } from './pages/datos-recuperados/datos-recuperados.component';
import { UsuariosAdmComponent } from './pages/usuarios-adm/usuarios-adm.component';
import { LoginComponent } from './pages/login/login.component';
import { RecuperarContrasenaComponent } from './pages/recuperar-contrasena/recuperar-contrasena.component';
import { RestablecerContrasenaComponent } from './pages/restablecer-contrasena/restablecer-contrasena.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { AcademicoComponent } from './pages/academico/academico.component';
import { LaboralComponent } from './pages/laboral/laboral.component';
import { PosgradoComponent } from './pages/posgrado/posgrado.component';
import { CertificacionesComponent } from './pages/certificaciones/certificaciones.component';
import { ReconocimientosComponent } from './pages/reconocimientos/reconocimientos.component';
import { DatosPersonalesComponent } from './pages/datos-personales/datos-personales.component';
import { SolicitarInfoComponent } from './pages/solicitar-info/solicitar-info.component';
import { NuevosAvisosComponent } from './pages/nuevos-avisos/nuevos-avisos.component';
import { BolsaTrabajoComponent } from './pages/bolsa-trabajo/bolsa-trabajo.component';
import { NuevaVacanteComponent } from './pages/nueva-vacante/nueva-vacante.component';
import { BolsaTrabajoEgresadoComponent } from './pages/bolsa-trabajo-egresado/bolsa-trabajo-egresado.component';

// Reportes nivel 1
import { AcademicoComponent as ReporteAcademicoComponent } from './pages/reportes/academico/academico.component';
import { LaboralComponent as ReporteLaboralComponent } from './pages/reportes/laboral/laboral.component';
import { PosgradoComponent as ReportePosgradoComponent } from './pages/reportes/posgrado/posgrado.component';
import { ReconocimientosComponent as ReporteReconocimientosComponent } from './pages/reportes/reconocimientos/reconocimientos.component';

// Dashboard
import { DashboardComponent } from './pages/dashboard/dashboard.component';

// Académico hijos
import { TituladoComponent } from './pages/reportes/academico/titulado/titulado.component';
import { TipoTitulacionComponent } from './pages/reportes/academico/tipo-titulacion/tipo-titulacion.component';
import { AnioEgresoComponent } from './pages/reportes/academico/anio-egreso/anio-egreso.component';
import { CantidadEgresadosComponent } from './pages/reportes/academico/cantidad-egresados/cantidad-egresados.component';

// Laboral hijos
import { SectorComponent } from './pages/reportes/laboral/sector/sector.component';
import { ConsiguioEmpleoComponent } from './pages/reportes/laboral/consiguio-empleo/consiguio-empleo.component';
import { TiempoEmpleoComponent } from './pages/reportes/laboral/tiempo-empleo/tiempo-empleo.component';
import { TipoContratoComponent } from './pages/reportes/laboral/tipo-contrato/tipo-contrato.component';
import { ModalidadLaboralComponent } from './pages/reportes/laboral/modalidad/modalidad.component';
import { RangoSalarioComponent } from './pages/reportes/laboral/rango-salario/rango-salario.component';
import { RelacionCarreraComponent } from './pages/reportes/laboral/relacion-carrera/relacion-carrera.component';
import { PrestacionesComponent } from './pages/reportes/laboral/prestaciones/prestaciones.component';
import { MapaUbicacionLaboralComponent } from './pages/reportes/laboral/mapa-ubicacion/mapa-ubicacion.component';

// Posgrado hijos
import { NivelComponent } from './pages/reportes/posgrado/nivel/nivel.component';
import { ModalidadPosgradoComponent } from './pages/reportes/posgrado/modalidad/modalidad.component';
import { EstatusComponent } from './pages/reportes/posgrado/estatus/estatus.component';
import { BecaComponent } from './pages/reportes/posgrado/beca/beca.component';
import { RelacionComponent } from './pages/reportes/posgrado/relacion/relacion.component';
import { TipoBecaComponent } from './pages/reportes/posgrado/tipo-beca/tipo-beca.component';

// Reconocimientos hijos
import { TipoComponent } from './pages/reportes/reconocimientos/tipo/tipo.component';
import { PorInstitucionComponent } from './pages/reportes/reconocimientos/por-institucion/por-institucion.component';
import { ListadoComponent } from './pages/reportes/reconocimientos/listado/listado.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'recuperar-contrasena', component: RecuperarContrasenaComponent },
  { path: 'restablecer-contrasena', component: RestablecerContrasenaComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'datos-personales', component: DatosPersonalesComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'academico', component: AcademicoComponent },
  { path: 'laboral', component: LaboralComponent },
  { path: 'posgrado', component: PosgradoComponent },
  { path: 'certificaciones', component: CertificacionesComponent },
  { path: 'reconocimientos', component: ReconocimientosComponent },
  { path: 'nuevos-avisos', component: NuevosAvisosComponent },
  { path: 'egresado/bolsaTrabajo', component: BolsaTrabajoEgresadoComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosAdmComponent },
      { path: 'datos-recuperados', component: DatosRecuperadosComponent },
      { path: 'solicitar-info', component: SolicitarInfoComponent },
      { path: 'bolsaTrabajo', component: BolsaTrabajoComponent },
      { path: 'bolsaTrabajo/nueva', component: NuevaVacanteComponent },
      // Reportes nivel 1
      { path: 'reportes/academico', component: ReporteAcademicoComponent },
      { path: 'reportes/laboral', component: ReporteLaboralComponent },
      { path: 'reportes/posgrado', component: ReportePosgradoComponent },
      { path: 'reportes/reconocimientos', component: ReporteReconocimientosComponent },
      // Académico hijos
      { path: 'reportes/academico/titulado', component: TituladoComponent },
      { path: 'reportes/academico/tipo-titulacion', component: TipoTitulacionComponent },
      { path: 'reportes/academico/anio-egreso', component: AnioEgresoComponent },
      { path: 'reportes/academico/cantidad-egresados', component: CantidadEgresadosComponent },
      // Laboral hijos
      { path: 'reportes/laboral/sector', component: SectorComponent },
      { path: 'reportes/laboral/consiguio-empleo', component: ConsiguioEmpleoComponent },
      { path: 'reportes/laboral/tiempo-empleo', component: TiempoEmpleoComponent },
      { path: 'reportes/laboral/tipo-contrato', component: TipoContratoComponent },
      { path: 'reportes/laboral/modalidad', component: ModalidadLaboralComponent },
      { path: 'reportes/laboral/rango-salario', component: RangoSalarioComponent },
      { path: 'reportes/laboral/relacion-carrera', component: RelacionCarreraComponent },
      { path: 'reportes/laboral/prestaciones', component: PrestacionesComponent },
      { path: 'reportes/laboral/mapa-ubicacion', component: MapaUbicacionLaboralComponent },
      // Posgrado hijos
      { path: 'reportes/posgrado/nivel', component: NivelComponent },
      { path: 'reportes/posgrado/modalidad', component: ModalidadPosgradoComponent },
      { path: 'reportes/posgrado/estatus', component: EstatusComponent },
      { path: 'reportes/posgrado/beca', component: BecaComponent },
      { path: 'reportes/posgrado/relacion', component: RelacionComponent },
      { path: 'reportes/posgrado/tipo-beca', component: TipoBecaComponent },
      // Reconocimientos hijos
      { path: 'reportes/reconocimientos/tipo', component: TipoComponent },
      { path: 'reportes/reconocimientos/por-institucion', component: PorInstitucionComponent },
      { path: 'reportes/reconocimientos/listado', component: ListadoComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
