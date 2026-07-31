import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpcionDescargaPdf } from '../../utils/descarga-graficas.util';

@Component({
  selector: 'app-selector-descarga-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-descarga-pdf.component.html',
  styleUrl: './selector-descarga-pdf.component.css'
})
export class SelectorDescargaPdfComponent implements OnChanges {
  @Input() visible = false;
  @Input() titulo = 'Descargar gráficas en PDF';
  @Input() opciones: OpcionDescargaPdf[] = [];
  @Input() cargando = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<string[]>();

  seleccionadas = new Set<string>();
  private estabaVisible = false;

  ngOnChanges(changes: SimpleChanges): void {
    const acabaDeAbrirse = !!changes['visible']
      && changes['visible'].currentValue === true
      && !this.estabaVisible;

    if (acabaDeAbrirse) {
      this.seleccionadas = new Set(this.opciones.map(o => o.id));
    }

    this.estabaVisible = this.visible;
  }

  get todasSeleccionadas(): boolean {
    return this.opciones.length > 0
      && this.opciones.every(o => this.seleccionadas.has(o.id));
  }

  get cantidadSeleccionadas(): number {
    return this.seleccionadas.size;
  }

  toggleTodas(): void {
    if (this.todasSeleccionadas) {
      this.seleccionadas = new Set();
    } else {
      this.seleccionadas = new Set(this.opciones.map(o => o.id));
    }
  }

  toggleOpcion(id: string): void {
    const siguiente = new Set(this.seleccionadas);
    if (siguiente.has(id)) {
      siguiente.delete(id);
    } else {
      siguiente.add(id);
    }
    this.seleccionadas = siguiente;
  }

  estaSeleccionada(id: string): boolean {
    return this.seleccionadas.has(id);
  }

  onCerrar(): void {
    if (!this.cargando) {
      this.cerrar.emit();
    }
  }

  onConfirmar(): void {
    if (this.cargando || this.seleccionadas.size === 0) {
      return;
    }
    this.confirmar.emit([...this.seleccionadas]);
  }
}
