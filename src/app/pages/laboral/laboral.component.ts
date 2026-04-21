import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-laboral',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './laboral.component.html',
  styleUrls: ['./laboral.component.css']
})
export class LaboralComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) {}

  usuario = 'Valeria';

  // UI
  mostrarFormulario = false;
  mostrarOtro = false;
  mensaje = '';
  menuOculto = false;

  // Perfil
  mostrarPopup = false;
  imagenPerfil: string | null = null;
  otroTexto = '';

  // Historial
  historial: any[] = [];
  laboralSeleccionado: any = null;

  listaPrestaciones = [
    'Infonavit',
    'Seguro Social',
    'Seguro Médico',
    'Fondo Ahorro',
    'Despensa',
    'Vacaciones'
  ];

  form: any = {};

  // ================= INIT =================
  ngOnInit() {
    this.resetForm();
    this.cargarHistorial();
  }

  // ================= HISTORIAL =================
  cargarHistorial() {
    this.http.get<any[]>(`http://localhost:8181/egresado/laboral/A1234567`)
      .subscribe(data => this.historial = data);
  }

  // ================= FORM =================
  resetForm() {
    this.form = {
      matricula: "A1234567",
      empresa: '',
      puesto: '',
      sector: '',
      medio: '',
      tiempo: '',
      contrato: '',
      modalidad: '',
      salario: '',
      prestaciones: '',
      listaSeleccionada: [],
      relacion: ''
    };
  }

  nuevoTrabajo() {
    this.mostrarFormulario = true;
    this.resetForm();
  }

  construirDatos() {
    const prestacionesFinal = [...this.form.listaSeleccionada];

    if (this.mostrarOtro && this.otroTexto) {
      prestacionesFinal.push(this.otroTexto);
    }

    return {
      matricula: this.form.matricula,
      empresa: this.form.empresa,
      puesto: this.form.puesto,
      sector: this.form.sector,
      comoConsiguio: this.form.medio,
      tiempoConseguir: this.form.tiempo,
      tipoContrato: this.form.contrato,
      modalidadTrabajo: this.form.modalidad,
      salario: this.form.salario,
      prestaciones: this.form.prestaciones === 'si',
      detallePrestaciones: prestacionesFinal.join(", "),
      relacionCarrera: this.form.relacion,
      comentarios: this.form.comentarios 
    };
  }

  guardar() {
    const datos = this.construirDatos();

    this.http.post("http://localhost:8181/egresado/laboral", datos)
      .subscribe({
        next: () => {
          this.mostrarMensaje("✓ Guardado correctamente");
          this.mostrarFormulario = false;
          this.cargarHistorial(); // 🔥 importante
        },
        error: () => this.mostrarMensaje("❌ Error al guardar")
      });
  }

  // ================= MODAL =================
  verDetalle(laboral: any) {
    this.laboralSeleccionado = { ...laboral };
  }

  cerrarModal() {
    this.laboralSeleccionado = null;
  }

  actualizarLaboral() {
  const laboral = this.laboralSeleccionado;

  this.http.put(`http://localhost:8181/egresado/laboral/${laboral.idLaboral}`, laboral)
    .subscribe({
      next: () => {
        const index = this.historial.findIndex(l => l.idLaboral === laboral.idLaboral);
        if (index !== -1) {
          this.historial[index] = { ...laboral };
        }
        this.mostrarMensaje("✓ Registro actualizado");
        this.cerrarModal();
      },
      error: () => this.mostrarMensaje("❌ Error al actualizar")
    });
}

  eliminarLaboral(id: number) {
    this.http.delete(`http://localhost:8181/egresado/laboral/${id}`)
      .subscribe({
        next: () => {
          this.mostrarMensaje("✓ Eliminado correctamente");
          this.cargarHistorial(); // 🔥 no hagas filter manual
        },
        error: () => this.mostrarMensaje("❌ Error al eliminar")
      });
  }

  // ================= PRESTACIONES =================
  onPrestacionesChange() {
    if (this.form.prestaciones !== 'si') {
      this.form.listaSeleccionada = [];
      this.mostrarOtro = false;
      this.otroTexto = '';
    }
  }

  togglePrestacion(event: any) {
    const value = event.target.value;

    if (event.target.checked) {
      this.form.listaSeleccionada.push(value);
    } else {
      this.form.listaSeleccionada =
        this.form.listaSeleccionada.filter((p: string) => p !== value);
    }
  }

  toggleOtro(event: any) {
    this.mostrarOtro = event.target.checked;

    if (!this.mostrarOtro) {
      this.otroTexto = '';
    }
  }

  // ================= UI =================
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenPerfil = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 3000);
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.resetForm();
  }

  cancelarEdicion() {
    this.laboralSeleccionado = null;
  }
}