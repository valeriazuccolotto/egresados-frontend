import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']   // ojo: debe ser "styleUrls" en plural
})
export class SidebarComponent {
  @Input() abierto = true;
  reportesAbierto = false;   // cerrado por defecto

  toggleReportes() {
    this.reportesAbierto = !this.reportesAbierto;
  }
}
