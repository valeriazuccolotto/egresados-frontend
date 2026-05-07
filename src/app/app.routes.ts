import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { AcademicoComponent } from './pages/reportes/academico/academico.component';
import { LaboralComponent } from './pages/reportes/laboral/laboral.component';
import { PosgradoComponent } from './pages/reportes/posgrado/posgrado.component';
import { ReconocimientosComponent } from './pages/reportes/reconocimientos/reconocimientos.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'reportes/academico', component: AcademicoComponent },
      { path: 'reportes/laboral', component: LaboralComponent },
      { path: 'reportes/posgrado', component: PosgradoComponent },
      { path: 'reportes/reconocimientos', component: ReconocimientosComponent },
      { path: '', redirectTo: 'reportes/academico', pathMatch: 'full' }
    ]
  }
];