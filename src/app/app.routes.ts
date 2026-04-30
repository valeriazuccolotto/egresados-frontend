import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { AcademicoComponent } from './pages/academico/academico.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

export const routes: Routes = [

  // 🔐 Login primero
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // 👨‍💼 Admin

  // 👨‍🎓 Egresado
  { path: 'perfil', component: PerfilComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'academico', component: AcademicoComponent },

  // 🚫 Ruta desconocida
  { path: '**', redirectTo: 'login' }
];