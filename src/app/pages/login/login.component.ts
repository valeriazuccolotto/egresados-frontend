import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  matricula    = '';
  password     = '';
  mostrarPassword = false;
  cargando     = false;
  errorMsg     = '';
  errorMatricula = false;
  errorPassword  = false;

  constructor(private http: HttpClient, private router: Router) {}

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  limpiarErrores() {
    this.errorMsg      = '';
    this.errorMatricula = false;
    this.errorPassword  = false;
  }

  iniciarSesion() {

    // Validaciones vacío
    if (!this.matricula && !this.password) {
      this.errorMatricula = true;
      this.errorPassword  = true;
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

    // Llamada al backend
    this.http.post<any>('http://localhost:8080/usuarios/login', {
      matricula: this.matricula,
      password:  this.password
    }).subscribe({
      next: (usuario) => {
        this.cargando = false;

        if (!usuario) {
          this.errorMsg = 'Matrícula o contraseña incorrectos.';
          this.errorMatricula = true;
          this.errorPassword  = true;
          return;
        }

        // Guardar en sessionStorage para uso posterior
        sessionStorage.setItem('usuario', JSON.stringify(usuario));

        // Redirigir según rol
        if (usuario.rol === 'ADMIN') {
          this.router.navigate(['/usuarios']);     // vista administrador
        } else {
          this.router.navigate(['/contacto']);     // vista egresado
        }
      },
      error: () => {
        this.cargando = false;
        this.errorMsg = 'Matrícula o contraseña incorrectos.';
        this.errorMatricula = true;
        this.errorPassword  = true;
      }
    });
  }
}