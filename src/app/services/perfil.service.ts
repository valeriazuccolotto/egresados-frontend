import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Perfil } from '../models/perfil';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private apiUrl = '/egresados';

  private fotoSubject = new BehaviorSubject<string>('assets/favicon-UNPA.ico');
  foto$ = this.fotoSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerPerfil(matricula: string): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.apiUrl}/perfil/${matricula}`);
  }

  subirFotoPerfil(matricula: string, archivo: File): Observable<any> {
    const formData = new FormData();
    // Compatibilidad: distintos backends usan diferente nombre de parte multipart.
    formData.append('file', archivo);
    formData.append('archivo', archivo);

    return this.http.post<any>(`${this.apiUrl}/foto-perfil/${matricula}`, formData).pipe(
      catchError(() =>
        this.http.post<any>(`/egresado/foto-perfil/${matricula}`, formData)
      )
    );
  }

  setFoto(url: string): void {
    this.fotoSubject.next(url);
  }
}