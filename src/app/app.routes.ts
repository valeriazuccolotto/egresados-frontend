import { Routes } from '@angular/router';

// ✅ Importa todos los componentes que usarás
import { DatosRecuperadosComponent } from './pages/datos-recuperados/datos-recuperados.component';
import { UsuariosAdmComponent } from './pages/usuarios-adm/usuarios-adm.component';
// Si ya tienes Dashboard, Encuestas, Empresas, también los importas aquí:
// import { DashboardComponent } from './pages/dashboard/dashboard.component';
// import { EncuestasComponent } from './pages/encuestas/encuestas.component';
// import { EmpresasComponent } from './pages/empresas/empresas.component';

export const routes: Routes = [
  // 🔹 Ruta por defecto
    { path: '', redirectTo: 'usuarios', pathMatch: 'full' },

    // 🔹 Tus páginas
    { path: 'usuarios', component: UsuariosAdmComponent },
    { path: 'datos-recuperados', component: DatosRecuperadosComponent },

  // 🔹 Ejemplo si ya integraste más páginas
  // { path: 'dashboard', component: DashboardComponent },
  // { path: 'encuestas', component: EncuestasComponent },
  // { path: 'empresas', component: EmpresasComponent }
];
