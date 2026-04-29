import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfilService } from '../../services/perfil.service';
import { Perfil } from '../../models/perfil';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  perfil?: Perfil;
  urlFoto: string = 'assets/default-user.png';

  constructor(private perfilService: PerfilService) {}

  ngOnInit(): void {

    // Escucha la foto global para que también cambie abajo
    this.perfilService.foto$.subscribe(url => {
      this.urlFoto = url;
    });

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    const matricula = localStorage.getItem('matricula') || '21010048';

    this.perfilService.obtenerPerfil(matricula).subscribe({
      next: (data) => {
        this.perfil = data;

        const foto = data.urlFoto
          ? `http://localhost:8189${data.urlFoto}?t=${Date.now()}`
          : 'assets/default-user.png';

        this.urlFoto = foto;

        // Actualiza también el header
        this.perfilService.setFoto(foto);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });
  }
}