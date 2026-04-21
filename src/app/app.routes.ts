import { Routes } from '@angular/router';
import { LaboralComponent } from './pages/laboral/laboral.component';
import { PosgradoComponent } from './pages/posgrado/posgrado.component';
import { CertificacionesComponent } from './pages/certificaciones/certificaciones.component'; // 👈 IMPORTANTE

export const routes: Routes = [
  { path: 'laboral', component: LaboralComponent },
  { path: 'posgrado', component: PosgradoComponent },
  { path: 'certificaciones', component: CertificacionesComponent },
  { path: '', redirectTo: 'laboral', pathMatch: 'full' }
];