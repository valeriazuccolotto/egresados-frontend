import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Contacto } from '../../models/contacto';
import { ContactoService } from '../../services/contacto.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent implements OnInit {

  mensajeExito = false;

  menuAbierto = true;
  guardado = false;
  nombreUsuario = '';
  inicial = '';

  contacto: Contacto = {
    matricula: '',
    correoPersonal: '',
    telefono: '',
    ciudad: '',
    estadoResidencia: '',
    instagram: '',
    facebook: ''
  };

  constructor(private contactoService: ContactoService) {}

  ngOnInit(): void {
    const raw = sessionStorage.getItem('usuario');

    if (raw) {
      const usuario: Usuario = JSON.parse(raw);

      this.contacto.matricula = usuario.matricula;
      this.nombreUsuario = usuario.matricula;
      this.inicial = usuario.matricula.charAt(0).toUpperCase();
    }
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  guardar(): void {
    this.contactoService.obtenerPorMatricula(this.contacto.matricula).subscribe({

      next: () => {
        this.contactoService.actualizar(this.contacto.matricula, this.contacto)
          .subscribe({
            next: (respuesta) => {
              console.log('Contacto actualizado:', respuesta);
              this.mensajeExito = true;
              this.guardado = true;
              setTimeout(() => this.guardado = false, 3000);
            },
            error: (error) => {
              console.error('Error al actualizar:', error);
              alert('Error al actualizar contacto');
            }
          });
      },

      error: () => {
        this.contactoService.guardar(this.contacto)
          .subscribe({
            next: (respuesta) => {
              console.log('Contacto guardado:', respuesta);
              this.mensajeExito = true;
              this.guardado = true;
              setTimeout(() => this.guardado = false, 3000);
            },
            error: (error) => {
              console.error('Error al guardar:', error);
              alert('Error al guardar contacto');
            }
          });
      }

    });
  }
}