import { Routes } from '@angular/router';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { AcademicoComponent } from './pages/academico/academico.component';

export const routes: Routes = [
  { path: 'contacto', component: ContactoComponent },
  { path: 'academico', component: AcademicoComponent },
  { path: '', redirectTo: 'contacto', pathMatch: 'full' }
];
