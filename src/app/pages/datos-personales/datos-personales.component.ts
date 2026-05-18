import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-datos-personales',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './datos-personales.component.html',
  styleUrls: ['./datos-personales.component.css']
})
export class DatosPersonalesComponent implements OnInit {

  matriculaUsuario: string = '';
  mensaje = '';

  form: any = {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    campus: '',
    generacion: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const raw = sessionStorage.getItem('usuario');

    if (!raw) {
      this.mensaje = "❌ No hay sesión activa";
      return;
    }

    const usuario: Usuario = JSON.parse(raw);
    this.matriculaUsuario = usuario.matricula;

    this.cargarDatos();
  }

  cargarDatos() {
    this.http.get<any>(`/egresados/${this.matriculaUsuario}`).pipe(
      catchError(() => this.http.get<any>(`/egresado/${this.matriculaUsuario}`))
    ).subscribe({
      next: (data) => {
        this.form = {
          nombre: data.nombre || '',
          apellidoPaterno: data.apellidoPaterno || '',
          apellidoMaterno: data.apellidoMaterno || '',
          campus: data.campus || '',
          generacion: data.generacion || ''
        };
      },
      error: () => {
        this.mensaje = '';
      }
    });
  }

  guardar() {
    const datos = {
      matricula: this.matriculaUsuario,
      nombre: this.form.nombre,
      apellidoPaterno: this.form.apellidoPaterno,
      apellidoMaterno: this.form.apellidoMaterno,
      campus: this.form.campus,
      generacion: this.form.generacion
    };

    console.log("DATOS ENVIADOS:", datos);

    this.http.post(`/egresados`, datos).pipe(
      catchError(() => this.http.post(`/egresado`, datos))
    ).subscribe({
      next: () => {
        this.mensaje = "✓ Perfil actualizado";
        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 1000);
      },
      error: (err) => {
        console.error("ERROR COMPLETO:", err);
        console.error("ERROR BACKEND:", err.error);
        this.mensaje = "❌ Error al guardar";
      }
    });
  }

  cancelar() {
    this.router.navigate(['/perfil']);
  }
}