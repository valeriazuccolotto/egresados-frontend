import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GraficasDataService } from '../../../../services/graficas-data.service';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.css'
})
export class ListadoComponent implements OnInit {
  campus = ['Todos','Loma Bonita','Tuxtepec'];
  campusSeleccionado = 'Todos';
  egresados: any[] = [];
  todos: any[] = [];
  filtrados: any[] = [];

  constructor(private svc: GraficasDataService) {}

  ngOnInit() {
    this.svc.getEgresados().subscribe(e => {
      this.egresados = e;
      this.svc.getReconocimientos().subscribe(r => { this.todos = r; this.filtrar(); });
    });
  }

  filtrar() {
    this.filtrados = this.svc.filtrarPorCampus(this.todos, this.egresados, this.campusSeleccionado);
  }
}