import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent implements OnInit {

  menuAbierto  = true;
  guardado     = false;
  nombreUsuario = '';
  inicial      = '';

  ngOnInit() {
    // Leer usuario guardado en login
    const raw = sessionStorage.getItem('usuario');
    if (raw) {
      const u = JSON.parse(raw);
      // La matrícula como nombre provisional hasta que llegue el módulo de tu compañera
      this.nombreUsuario = u.matricula;
      this.inicial = u.matricula.charAt(0).toUpperCase();
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // TODO: reemplazar con llamada real al servicio de tu compañera
  simularGuardado() {
    this.guardado = true;
    setTimeout(() => this.guardado = false, 3000);
  }
}