import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DatosRecuperadosComponent } from './pages/datos-recuperados/datos-recuperados.component';
import { UsuariosAdmComponent } from './pages/usuarios-adm/usuarios-adm.component';
import { LoginComponent } from './pages/login/login.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { AcademicoComponent } from './pages/academico/academico.component';
import { LaboralComponent } from './pages/laboral/laboral.component';
import { PosgradoComponent } from './pages/posgrado/posgrado.component';
import { CertificacionesComponent } from './pages/certificaciones/certificaciones.component';
import { ReconocimientosComponent } from './pages/reconocimientos/reconocimientos.component';
import { DatosPersonalesComponent } from './pages/datos-personales/datos-personales.component';
import { AcademicoComponent as ReporteAcademicoComponent } from './pages/reportes/academico/academico.component';
import { LaboralComponent as ReporteLaboralComponent } from './pages/reportes/laboral/laboral.component';
import { PosgradoComponent as ReportePosgradoComponent } from './pages/reportes/posgrado/posgrado.component';
import { ReconocimientosComponent as ReporteReconocimientosComponent } from './pages/reportes/reconocimientos/reconocimientos.component';
import { SolicitarInfoComponent } from './pages/solicitar-info/solicitar-info.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'datos-personales', component: DatosPersonalesComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'academico', component: AcademicoComponent },
  { path: 'laboral', component: LaboralComponent },
  { path: 'posgrado', component: PosgradoComponent },
  { path: 'certificaciones', component: CertificacionesComponent },
  { path: 'reconocimientos', component: ReconocimientosComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: UsuariosAdmComponent },
      { path: 'datos-recuperados', component: DatosRecuperadosComponent },
      { path: 'solicitar-info', component: SolicitarInfoComponent },
      { path: 'reportes/academico', component: ReporteAcademicoComponent },
      { path: 'reportes/laboral', component: ReporteLaboralComponent },
      { path: 'reportes/posgrado', component: ReportePosgradoComponent },
      { path: 'reportes/reconocimientos', component: ReporteReconocimientosComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
