import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-btn-validar-campo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './btn-validar-campo.component.html',
  styleUrl: './btn-validar-campo.component.css'
})
export class BtnValidarCampoComponent {
  @Input() validando = false;
  @Input() deshabilitado = false;
  @Input() valorActual: string | number | null | undefined = '';
  @Input() valorValidadoGuardado: string | null | undefined = '';

  @Output() validar = new EventEmitter<void>();

  get debeMostrarBoton(): boolean {
    return this.tieneDato(this.valorActual) && !this.estaValidadoActual;
  }

  get estaValidadoActual(): boolean {
    if (!this.tieneDato(this.valorActual)) {
      return false;
    }
    const guardado = this.normalizar(this.valorValidadoGuardado);
    if (!guardado) {
      return false;
    }
    return guardado === this.normalizar(this.valorActual);
  }

  private tieneDato(valor: unknown): boolean {
    const texto = this.normalizar(valor);
    if (!texto) {
      return false;
    }
    const vacios = new Set([
      'no registrado',
      'no registrada',
      'sin comentarios',
      'no aplica',
      'no cuenta con prestaciones',
      'sin carrera registrada'
    ]);
    return !vacios.has(texto.toLowerCase());
  }

  private normalizar(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '';
    }
    return String(valor).trim();
  }
}
