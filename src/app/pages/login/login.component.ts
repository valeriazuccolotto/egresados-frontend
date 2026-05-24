import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['../../styles/login-auth.css']
})
export class LoginComponent implements OnInit {

  matricula = '';
  password = '';
  mostrarPassword = false;
  cargando = false;
  errorMsg = '';
  errorMatricula = false;
  errorPassword = false;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    sessionStorage.removeItem('usuario');
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  limpiarErrores() {
    this.errorMsg = '';
    this.errorMatricula = false;
    this.errorPassword = false;
  }

  iniciarSesion() {

    // 🔴 Validaciones
    if (!this.matricula && !this.password) {
      this.errorMatricula = true;
      this.errorPassword = true;
      this.errorMsg = 'Por favor completa todos los campos.';
      return;
    }

    if (!this.matricula) {
      this.errorMatricula = true;
      this.errorMsg = 'Ingresa tu matrícula.';
      return;
    }

    if (!this.password) {
      this.errorPassword = true;
      this.errorMsg = 'Ingresa tu contraseña.';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    // 🚀 LOGIN usando service
    const matriculaNorm = this.matricula.trim();
    const usuario: Usuario = {
      matricula: /^\d+$/.test(matriculaNorm) && matriculaNorm.length <= 8
        ? matriculaNorm.padStart(8, '0')
        : matriculaNorm,
      password: this.password.trim()
    };

    this.usuarioService.login(usuario).subscribe({
      next: (res) => {
        this.cargando = false;

        if (!res) {
          this.errorMsg = 'Matrícula o contraseña incorrectos.';
          this.errorMatricula = true;
          this.errorPassword = true;
          return;
        }

        // 💾 Guardar sesión
        sessionStorage.setItem('usuario', JSON.stringify(res));

        // 🔀 Redirección
        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/perfil']);
        }
      },
      error: () => {
        this.cargando = false;
        this.errorMsg = 'Matrícula o contraseña incorrectos.';
        this.errorMatricula = true;
        this.errorPassword = true;
      }
    });
  }
}