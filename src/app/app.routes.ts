import { Routes } from '@angular/router';
import { LaboralComponent } from './pages/laboral/laboral.component';
import { PosgradoComponent } from './pages/posgrado/posgrado.component';

export const routes: Routes = [
  { path: 'laboral', component: LaboralComponent },
  { path: 'posgrado', component: PosgradoComponent },
  { path: '', redirectTo: 'laboral', pathMatch: 'full' }
];