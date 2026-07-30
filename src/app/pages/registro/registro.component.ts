import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SolicitudRegistroService } from '../../services/solicitud-registro.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['../../styles/login-auth.css', './registro.component.css']
})
export class RegistroComponent {

  nombre = '';
  apellidoPaterno = '';
  apellidoMaterno = '';
  matricula = '';
  curp = '';
  correo = '';

  cargando = false;
  enviado = false;
  errorMsg = '';
  exitoMsg = '';

  constructor(private solicitudRegistroService: SolicitudRegistroService) {}

  enviar(): void {
    this.errorMsg = '';
    this.exitoMsg = '';

    const nombre = this.nombre.trim();
    const apellidoPaterno = this.apellidoPaterno.trim();
    const apellidoMaterno = this.apellidoMaterno.trim();
    const matriculaRaw = this.matricula.trim();
    const curp = this.curp.trim().toUpperCase();
    const correo = this.correo.trim().toLowerCase();

    if (!nombre) {
      this.errorMsg = 'El nombre es obligatorio.';
      return;
    }
    if (!apellidoPaterno && !apellidoMaterno) {
      this.errorMsg = 'Debes indicar al menos un apellido.';
      return;
    }
    if (!matriculaRaw) {
      this.errorMsg = 'La matrícula es obligatoria.';
      return;
    }
    if (!/^[A-Z0-9]{18}$/.test(curp)) {
      this.errorMsg = 'La CURP debe tener 18 caracteres alfanuméricos.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.errorMsg = 'El correo electrónico no es válido.';
      return;
    }

    const matricula = /^\d+$/.test(matriculaRaw) && matriculaRaw.length <= 8
      ? matriculaRaw.padStart(8, '0')
      : matriculaRaw;

    this.cargando = true;
    this.solicitudRegistroService.registrar({
      nombre,
      apellidoPaterno: apellidoPaterno || undefined,
      apellidoMaterno: apellidoMaterno || undefined,
      matricula,
      curp,
      correo
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.enviado = true;
        this.exitoMsg = 'Solicitud enviada. Un administrador la revisará y te avisaremos por correo.';
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.mensaje || 'No se pudo enviar la solicitud. Intenta de nuevo.';
      }
    });
  }
}
