import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-definir-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './definir-contrasena.component.html',
  styleUrls: ['../../styles/login-auth.css']
})
export class DefinirContrasenaComponent implements OnInit {

  matricula = '';
  passwordActual = '';
  nuevaPassword = '';
  confirmarPassword = '';
  mostrarActual = false;
  mostrarNueva = false;
  mostrarConfirmar = false;
  cargando = false;
  errorMsg = '';
  exitoMsg = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const raw = sessionStorage.getItem('usuario');
    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      const usuario = JSON.parse(raw);
      this.matricula = usuario.matricula || '';
      if (!usuario.debeCambiarPassword) {
        this.router.navigate(['/perfil']);
      }
    } catch {
      this.router.navigate(['/login']);
    }
  }

  guardar(): void {
    this.errorMsg = '';
    this.exitoMsg = '';

    if (!this.passwordActual || !this.nuevaPassword || !this.confirmarPassword) {
      this.errorMsg = 'Completa todos los campos.';
      return;
    }
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.errorMsg = 'Las contraseñas nuevas no coinciden.';
      return;
    }
    if (this.nuevaPassword.length < 4) {
      this.errorMsg = 'La nueva contraseña debe tener al menos 4 caracteres.';
      return;
    }

    this.cargando = true;
    this.usuarioService.definirContrasena({
      matricula: this.matricula,
      passwordActual: this.passwordActual.trim(),
      nuevaPassword: this.nuevaPassword.trim(),
      confirmarPassword: this.confirmarPassword.trim()
    }).subscribe({
      next: (res) => {
        this.cargando = false;
        this.exitoMsg = res.mensaje || 'Contraseña definida.';
        const raw = sessionStorage.getItem('usuario');
        if (raw) {
          const usuario = JSON.parse(raw);
          usuario.debeCambiarPassword = false;
          sessionStorage.setItem('usuario', JSON.stringify(usuario));
        }
        setTimeout(() => this.router.navigate(['/perfil']), 900);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.mensaje || 'No se pudo definir la contraseña.';
      }
    });
  }
}
