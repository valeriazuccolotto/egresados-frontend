import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['../../styles/login-auth.css']
})
export class RecuperarContrasenaComponent {

  correo = '';
  cargando = false;
  errorMsg = '';
  exitoMsg = '';
  errorCorreo = false;
  enviado = false;

  constructor(private usuarioService: UsuarioService) {}

  enviarEnlace(): void {
    this.errorMsg = '';
    this.exitoMsg = '';
    this.errorCorreo = false;

    const correo = this.correo.trim();
    if (!correo) {
      this.errorCorreo = true;
      this.errorMsg = 'Ingresa el correo registrado en tu perfil.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.errorCorreo = true;
      this.errorMsg = 'Ingresa un correo válido.';
      return;
    }

    this.cargando = true;

    this.usuarioService.recuperarContrasena(correo).subscribe({
      next: (res) => {
        this.cargando = false;
        this.enviado = true;
        this.exitoMsg = res.mensaje;
      },
      error: (err) => {
        this.cargando = false;
        this.enviado = false;
        this.errorMsg = err?.error?.mensaje ?? 'No se pudo enviar el aviso. Intenta más tarde.';
        if (err?.status === 400) {
          this.errorCorreo = true;
        }
      }
    });
  }
}
