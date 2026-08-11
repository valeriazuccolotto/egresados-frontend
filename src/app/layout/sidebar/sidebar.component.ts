import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SolicitudesPendientesAdminService } from '../../services/solicitudes-pendientes-admin.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() abierto = true;
  reportesAbierto = false;
  subMenuAbierto: string | null = null;
  haySolicitudesPendientes = false;

  private pendientesSub?: Subscription;

  constructor(
    private router: Router,
    private solicitudesPendientesAdmin: SolicitudesPendientesAdminService
  ) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects;
      if (url.includes('reportes/reconocimientos')) this.subMenuAbierto = 'reconocimientos';
      else if (url.includes('reportes/posgrado')) this.subMenuAbierto = 'posgrado';
      else if (url.includes('reportes/academico')) this.subMenuAbierto = 'academico';
      else if (url.includes('reportes/laboral')) this.subMenuAbierto = 'laboral';
      else this.subMenuAbierto = null;

      if (url.includes('reportes')) this.reportesAbierto = true;
    });
  }

  ngOnInit(): void {
    this.solicitudesPendientesAdmin.iniciarPolling();
    this.pendientesSub = this.solicitudesPendientesAdmin.hayPendientes$.subscribe(
      pendiente => this.haySolicitudesPendientes = pendiente
    );
  }

  ngOnDestroy(): void {
    this.pendientesSub?.unsubscribe();
  }

  toggleReportes() {
    this.reportesAbierto = !this.reportesAbierto;
  }

  toggleSubMenu(seccion: string) {
    this.subMenuAbierto = this.subMenuAbierto === seccion ? null : seccion;
  }
}
