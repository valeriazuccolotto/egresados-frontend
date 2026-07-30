import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { EgresadoService } from '../../services/egresado.service';

@Component({
  selector: 'app-datos-personales',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private egresadoService: EgresadoService, private router: Router) {}

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
    this.egresadoService.getByMatricula(this.matriculaUsuario).subscribe({
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

    this.egresadoService.guardar(datos).subscribe({
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