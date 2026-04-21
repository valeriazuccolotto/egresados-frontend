import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UsuariosAdmComponent } from './pages/usuarios-adm/usuarios-adm.component';
import { ContactoComponent } from './pages/contacto/contacto.component';

export const routes: Routes = [
  { path: '',         redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',    component: LoginComponent },
  { path: 'usuarios', component: UsuariosAdmComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: '**',       redirectTo: 'login' }
];