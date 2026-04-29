import { Routes } from '@angular/router';
<<<<<<< HEAD
import { ContactoComponent } from './pages/contacto/contacto.component';
import { AcademicoComponent } from './pages/academico/academico.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

export const routes: Routes = [
  { path: 'contacto', component: ContactoComponent },
  { path: 'academico', component: AcademicoComponent },
  { path: 'perfil', component: PerfilComponent},
   
  { path: '', redirectTo: 'contacto', pathMatch: 'full' }
];
=======
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
>>>>>>> origin/login
