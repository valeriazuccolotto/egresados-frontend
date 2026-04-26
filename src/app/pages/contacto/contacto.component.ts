import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Contacto } from '../../models/contacto';
import { ContactoService } from '../../services/contacto.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {

  mensajeExito = '';
  mensajeError = '';

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

  guardar(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.contacto.matricula.trim()) {
      this.mensajeError = 'La matrícula es obligatoria.';
      return;
    }

    if (!this.validarCorreo(this.contacto.correoPersonal)) {
      this.mensajeError = 'El correo personal no tiene un formato válido.';
      return;
    }

    if (this.contacto.telefono && !this.validarTelefono(this.contacto.telefono)) {
      this.mensajeError = 'El teléfono debe tener exactamente 10 dígitos.';
      return;
    }

    this.contactoService.obtenerPorMatricula(this.contacto.matricula).subscribe({
      next: () => {
        this.actualizarContacto();
      },
      error: () => {
        this.guardarContactoNuevo();
      }
    });
  }

  private guardarContactoNuevo(): void {
    this.contactoService.guardar(this.contacto).subscribe({
      next: () => {
        this.mensajeExito = '✓ Información guardada correctamente.';
        this.mensajeError = '';
      },
      error: () => {
        this.mensajeExito = '';
        this.mensajeError = 'Error al guardar contacto.';
      }
    });
  }

  private actualizarContacto(): void {
    this.contactoService.actualizar(this.contacto.matricula, this.contacto).subscribe({
      next: () => {
        this.mensajeExito = '✓ Información actualizada correctamente.';
        this.mensajeError = '';
      },
      error: () => {
        this.mensajeExito = '';
        this.mensajeError = 'Error al actualizar contacto.';
      }
    });
  }

  private validarCorreo(correo: string): boolean {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(correo);
  }

  private validarTelefono(telefono: string): boolean {
    const regex = /^[0-9]{10}$/;
    return regex.test(telefono);
  }
}