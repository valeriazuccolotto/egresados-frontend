import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

// ✅ Importa todos los componentes que usarás
import { DatosRecuperadosComponent } from './pages/datos-recuperados/datos-recuperados.component';
import { UsuariosAdmComponent } from './pages/usuarios-adm/usuarios-adm.component';

// 📊 Reportes
import { AcademicoComponent } from './pages/reportes/academico/academico.component';
import { LaboralComponent } from './pages/reportes/laboral/laboral.component';
import { PosgradoComponent } from './pages/reportes/posgrado/posgrado.component';
import { ReconocimientosComponent } from './pages/reportes/reconocimientos/reconocimientos.component';

// 🔹 Si ya tienes Dashboard, Encuestas, Empresas, también los importas aquí
// import { DashboardComponent } from './pages/dashboard/dashboard.component';
// import { EncuestasComponent } from './pages/encuestas/encuestas.component';
// import { EmpresasComponent } from './pages/empresas/empresas.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      // 🔹 Ruta por defecto
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },

      // 🔹 Tus páginas
      { path: 'usuarios', component: UsuariosAdmComponent },
      { path: 'datos-recuperados', component: DatosRecuperadosComponent },

      // 📊 Reportes
      { path: 'reportes/academico', component: AcademicoComponent },
      { path: 'reportes/laboral', component: LaboralComponent },
      { path: 'reportes/posgrado', component: PosgradoComponent },
      { path: 'reportes/reconocimientos', component: ReconocimientosComponent },

      // 🔹 Ejemplo si ya integraste más páginas
      // { path: 'dashboard', component: DashboardComponent },
      // { path: 'encuestas', component: EncuestasComponent },
      // { path: 'empresas', component: EmpresasComponent }
    ]
  }
];
