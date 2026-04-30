import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { AcademicoComponent } from './pages/academico/academico.component';
import { LaboralComponent } from './pages/laboral/laboral.component';
import { PosgradoComponent } from './pages/posgrado/posgrado.component';
import { CertificacionesComponent } from './pages/certificaciones/certificaciones.component';
import { ReconocimientosComponent } from './pages/reconocimientos/reconocimientos.component';

export const routes: Routes = [

  // 🔐 Login primero
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // 👨‍🎓 Egresado
  { path: 'perfil', component: PerfilComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'academico', component: AcademicoComponent },
  { path: 'laboral', component: LaboralComponent },
  { path: 'posgrado', component: PosgradoComponent },
  { path: 'certificaciones', component: CertificacionesComponent },
  { path: 'reconocimientos', component: ReconocimientosComponent },


  { path: '**', redirectTo: 'login' }
];