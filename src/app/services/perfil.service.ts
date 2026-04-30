import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Perfil } from '../models/perfil';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private apiUrl = 'http://localhost:8189/egresados';

  private fotoSubject = new BehaviorSubject<string>('assets/default-user.png');
  foto$ = this.fotoSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerPerfil(matricula: string): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.apiUrl}/perfil/${matricula}`);
  }

  subirFotoPerfil(matricula: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);

    return this.http.post<any>(
      `${this.apiUrl}/foto-perfil/${matricula}`,
      formData
    );
  }

  setFoto(url: string): void {
    this.fotoSubject.next(url);
  }
}