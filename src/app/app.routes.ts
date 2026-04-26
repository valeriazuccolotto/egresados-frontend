import { Routes } from '@angular/router';
import { ContactoComponent } from './pages/contacto/contacto.component';

export const routes: Routes = [
  { path: 'contacto', component: ContactoComponent },
  { path: '', redirectTo: 'contacto', pathMatch: 'full' }
];