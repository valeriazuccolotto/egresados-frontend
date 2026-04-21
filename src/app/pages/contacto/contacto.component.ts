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

  mensajeExito = false;

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

  this.contactoService.obtenerPorMatricula(this.contacto.matricula).subscribe({

    // 👉 SI EXISTE → ACTUALIZA
    next: () => {
      this.contactoService.actualizar(this.contacto.matricula, this.contacto)
        .subscribe({
          next: (respuesta) => {
            console.log('Contacto actualizado:', respuesta);
            this.mensajeExito = true;
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            alert('Error al actualizar contacto');
          }
        });
    },

    // 👉 SI NO EXISTE → CREA
    error: () => {
      this.contactoService.guardar(this.contacto)
        .subscribe({
          next: (respuesta) => {
            console.log('Contacto guardado:', respuesta);
            this.mensajeExito = true;
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