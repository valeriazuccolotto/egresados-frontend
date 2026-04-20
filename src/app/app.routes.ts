import { Routes } from '@angular/router';
import { LaboralComponent } from './pages/laboral/laboral.component';

export const routes: Routes = [
    { path: 'laboral', component: LaboralComponent },
    { path: '', redirectTo: 'laboral', pathMatch: 'full' }
];