import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-posgrado',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './posgrado.component.html',
  styleUrls: ['./posgrado.component.css']
})
export class PosgradoComponent {

  constructor(private router: Router, private http: HttpClient) {}

  // ===== USUARIO =====
  usuario = 'Valeria';

  // ===== UI =====
  menuOculto = false;
  mostrarPopup = false;

  // ===== CONTROL DE FORMULARIOS =====
  mostrarPosgrado = false;
  mostrarCert = false;
  mostrarReco = false;

  mensaje = '';

  // ===== FORM =====
  form: any = {

    // POSGRADO
    nivel: '',
    institucion: '',
    programa: '',
    modalidad: '',
    estatus: '',
    relacion: '',
    inicio: '',
    fin: '',
    beca: false,

    // CERTIFICACIÓN (CORRECTO)
    certNombre: '',
    certInicio: '',
    certFin: '',
    certObtencion: '',

    // RECONOCIMIENTO (CORRECTO)
    recoNombre: '',
    recoTipo: '',
    recoFecha: '',
    recoInstitucion: ''
  };

  // ===== HEADER =====
  toggleMenu() {
    this.menuOculto = !this.menuOculto;
  }

  irNotificaciones() {
    this.router.navigate(['/notificaciones']);
  }

  togglePopup(event: Event) {
    event.stopPropagation();
    this.mostrarPopup = !this.mostrarPopup;
  }

  // ===== MOSTRAR FORMULARIOS =====
  mostrar(tipo: string) {

    // reset
    this.mostrarPosgrado = false;
    this.mostrarCert = false;
    this.mostrarReco = false;

    if (tipo === 'posgrado') this.mostrarPosgrado = true;
    if (tipo === 'certificacion') this.mostrarCert = true;
    if (tipo === 'reconocimiento') this.mostrarReco = true;
  }

  // ===== GUARDAR =====
  guardar() {

  // ===== POSGRADO =====
  if (this.mostrarPosgrado) {

    const datos = {
    matricula: "A1234567",

    nivelEstudio: this.form.nivel,
    institucion: this.form.institucion,
    nombrePrograma: this.form.programa,

    modalidad: this.form.modalidad,
    estatus: this.form.estatus,
    relacionadoCarrera: this.form.relacion,

    fechaInicio: this.form.inicio,
    fechaFin: this.form.fin,

    tieneBeca: this.form.beca
  };

    this.http.post('http://localhost:8181/egresado/posgrado', datos)
      .subscribe({
        next: () => this.mostrarMensaje("✓ Posgrado guardado"),
        error: () => this.mostrarMensaje("❌ Error al guardar posgrado")
      });
  }

  // ===== CERTIFICACIÓN =====
  if (this.mostrarCert) {

    const datos = {
      matricula: "A1234567", 
      nombreCertificacion: this.form.certNombre,
      fechaInicio: this.form.certInicio,
      fechaFin: this.form.certFin,
      fechaObtencion: this.form.certObtencion
    };

    this.http.post('http://localhost:8181/egresado/certificaciones', datos)
      .subscribe({
        next: () => this.mostrarMensaje("✓ Certificación guardada"),
        error: () => this.mostrarMensaje("❌ Error al guardar certificación")
      });
  }

  // ===== RECONOCIMIENTO =====
  if (this.mostrarReco) {

  const datos = {
  matricula: "A1234567", 
  nombreReconocimiento: this.form.recoNombre,
  tipoReconocimiento: this.form.recoTipo,
  fechaEntrega: this.form.recoFecha,
  institucion: this.form.recoInstitucion
};

  this.http.post('http://localhost:8181/egresado/reconocimientos', datos)
    .subscribe({
      next: () => this.mostrarMensaje("✓ Reconocimiento guardado"),
      error: () => this.mostrarMensaje("❌ Error al guardar reconocimiento")
    });
}

}

mostrarMensaje(texto: string) {
  this.mensaje = texto;
  setTimeout(() => this.mensaje = '', 3000);
}

}