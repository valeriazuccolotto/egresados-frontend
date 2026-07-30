import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  matricula: string;
  password: string;
  rol?: string;
  activo?: boolean;
  debeCambiarPassword?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = '/usuarios';

  constructor(private http: HttpClient) {}

  login(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, usuario);
  }

  recuperarContrasena(correo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/recuperar-contrasena`, { correo });
  }

  validarTokenRecuperacion(token: string): Observable<{ valido: boolean }> {
    return this.http.get<{ valido: boolean }>(`${this.apiUrl}/validar-token-recuperacion`, {
      params: { token }
    });
  }

  restablecerContrasena(body: {
    token: string;
    nuevaPassword: string;
    confirmarPassword: string;
  }): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/restablecer-contrasena`, body);
  }

  definirContrasena(body: {
    matricula: string;
    passwordActual: string;
    nuevaPassword: string;
    confirmarPassword: string;
  }): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/definir-contrasena`, body);
  }
}
