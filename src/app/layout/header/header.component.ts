import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']   // ojo: debe ser "styleUrls" en plural
})
export class HeaderComponent {
  @Output() menuClick = new EventEmitter<void>();

  toggleMenu() {
    this.menuClick.emit();
  }
}
