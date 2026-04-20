import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posgrado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posgrado.component.html',
  styleUrls: ['./posgrado.component.css']
})
export class PosgradoComponent {

  constructor(private router: Router) {}

  // ===== USUARIO =====
  usuario = 'Valeria';

  // ===== UI =====
  menuOculto = false;
  mostrarPopup = false;

  // ===== CONTROL DE FORMULARIOS =====
  mostrarPosgrado = false;
  mostrarCert = false;
  mostrarReco = false;

  mensaje = '';

  // ===== FORM =====
  form: any = {
    nivel: '',
    institucion: '',
    programa: '',
    modalidad: '',
    estatus: '',
    relacion: '',
    inicio: '',
    fin: '',
    beca: '',

    certNombre: '',
    certInst: '',
    certFecha: '',

    recoNombre: ''
  };

  // ===== HEADER =====
  toggleMenu() {
    this.menuOculto = !this.menuOculto;
  }

  irNotificaciones() {
    this.router.navigate(['/notificaciones']);
  }

  togglePopup(event: Event) {
    event.stopPropagation();
    this.mostrarPopup = !this.mostrarPopup;
  }

  // ===== MOSTRAR FORMULARIOS =====
  mostrar(tipo: string) {

    // reset
    this.mostrarPosgrado = false;
    this.mostrarCert = false;
    this.mostrarReco = false;

    if (tipo === 'posgrado') this.mostrarPosgrado = true;
    if (tipo === 'certificacion') this.mostrarCert = true;
    if (tipo === 'reconocimiento') this.mostrarReco = true;
  }

  // ===== GUARDAR =====
  guardar() {

    console.log("Datos enviados:", this.form);

    // Aquí luego conectas backend igual que laboral

    this.mensaje = "✓ Guardado correctamente";

    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

}