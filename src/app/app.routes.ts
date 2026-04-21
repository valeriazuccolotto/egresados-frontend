import { Routes } from '@angular/router';
import { UsuariosAdmComponent } from './pages/usuarios-adm/usuarios-adm.component';

export const routes: Routes = [

  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },

  { path: 'usuarios', component: UsuariosAdmComponent }

];