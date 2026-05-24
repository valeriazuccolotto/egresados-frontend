import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './restablecer-contrasena.component.html',
  styleUrls: ['../../styles/login-auth.css']
})
export class RestablecerContrasenaComponent implements OnInit {

  token = '';
  nuevaPassword = '';
  confirmarPassword = '';
  mostrarNueva = false;
  mostrarConfirmar = false;
  cargando = false;
  validandoToken = true;
  tokenValido = false;
  errorMsg = '';
  exitoMsg = '';
  errorNueva = false;
  errorConfirmar = false;

  constructor(
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = (this.route.snapshot.queryParamMap.get('token') ?? '').trim();

    if (!this.token) {
      this.validandoToken = false;
      this.tokenValido = false;
      this.errorMsg = 'El enlace no es válido. Solicita uno nuevo desde el login.';
      return;
    }

    this.usuarioService.validarTokenRecuperacion(this.token).subscribe({
      next: (res) => {
        this.validandoToken = false;
        this.tokenValido = res.valido;
        if (!res.valido) {
          this.errorMsg = 'El enlace expiró o ya fue utilizado. Solicita uno nuevo.';
        }
      },
      error: () => {
        this.validandoToken = false;
        this.tokenValido = false;
        this.errorMsg = 'No se pudo validar el enlace. Intenta de nuevo más tarde.';
      }
    });
  }

  toggleNueva(): void {
    this.mostrarNueva = !this.mostrarNueva;
  }

  toggleConfirmar(): void {
    this.mostrarConfirmar = !this.mostrarConfirmar;
  }

  guardar(): void {
    this.errorMsg = '';
    this.exitoMsg = '';
    this.errorNueva = false;
    this.errorConfirmar = false;

    if (!this.nuevaPassword || !this.confirmarPassword) {
      if (!this.nuevaPassword) this.errorNueva = true;
      if (!this.confirmarPassword) this.errorConfirmar = true;
      this.errorMsg = 'Completa ambos campos.';
      return;
    }

    if (this.nuevaPassword.length < 4) {
      this.errorNueva = true;
      this.errorMsg = 'La contraseña debe tener al menos 4 caracteres.';
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.errorNueva = true;
      this.errorConfirmar = true;
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;

    this.usuarioService.restablecerContrasena({
      token: this.token,
      nuevaPassword: this.nuevaPassword.trim(),
      confirmarPassword: this.confirmarPassword.trim()
    }).subscribe({
      next: (res) => {
        this.cargando = false;
        this.exitoMsg = res.mensaje;
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg =
          err?.error?.mensaje ?? 'No se pudo actualizar la contraseña. El enlace puede haber expirado.';
      }
    });
  }
}
