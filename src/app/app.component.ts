import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PerfilService } from './services/perfil.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  
})
export class AppComponent implements OnInit, OnDestroy {
  porcentajePerfil = 0;
  esLogin = false;
  esAdmin = false;
  title = 'egresados-frontend';
  sidebarHidden = false;

  @ViewChild('photoMenuRoot') photoMenuRoot?: ElementRef<HTMLElement>;
  @ViewChild('galleryInput') galleryInput?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput?: ElementRef<HTMLInputElement>;
  @ViewChild('cameraVideo') cameraVideo?: ElementRef<HTMLVideoElement>;

  mostrarPanelFoto = false;
  cameraModalOpen = false;
  cameraError = '';
  cameraCapturedPreview: string | null = null;
  private cameraStream: MediaStream | null = null;

  fotoGlobal: string = 'assets/favicon-UNPA.ico';
  private readonly backendOrigin = 'http://localhost:8181';

  constructor(
  private perfilService: PerfilService,
  private router: Router,
  private http: HttpClient
) {
  this.actualizarEstadoLayout(this.router.url);

  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.actualizarEstadoLayout(event.urlAfterRedirects);

      if (!this.esLogin && !this.esAdmin) {
        this.calcularProgreso();
      }
    });
}
ngOnInit(): void {
  this.perfilService.foto$.subscribe(url => {
    this.fotoGlobal = url;
  });

  this.calcularProgreso();
}

ngOnDestroy(): void {
  this.stopCameraStream();
}

toggleSidebar(): void {
  this.sidebarHidden = !this.sidebarHidden;
}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.mostrarPanelFoto) return;

    const root = this.photoMenuRoot?.nativeElement;

    if (root?.contains(event.target as Node)) return;

    this.mostrarPanelFoto = false;
  }

  togglePhotoMenu(): void {
    this.mostrarPanelFoto = !this.mostrarPanelFoto;
  }

  openGalleryPicker(): void {
    this.mostrarPanelFoto = false;
    this.galleryInput?.nativeElement.click();
  }

  async openCameraPicker(): Promise<void> {
    this.mostrarPanelFoto = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraInput?.nativeElement.click();
      return;
    }

    this.cameraError = '';
    this.cameraModalOpen = true;
    this.cameraCapturedPreview = null;

    await this.startCameraStream();
  }

  private async startCameraStream(): Promise<void> {
    this.stopCameraStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });

      this.cameraStream = stream;

      setTimeout(() => {
        const video = this.cameraVideo?.nativeElement;
        if (!video || !this.cameraStream) return;

        video.srcObject = this.cameraStream;
        video.play();
      });

    } catch (error) {
      console.error('No se pudo abrir la cámara:', error);
      this.cameraError = 'No se pudo abrir la cámara. Revisa los permisos.';
      this.cameraInput?.nativeElement.click();
      this.closeCameraModal();
    }
  }

  captureFromCamera(): void {
    const video = this.cameraVideo?.nativeElement;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    // Reduce resolution to avoid files >5MB from high-res cameras.
    const maxDimension = 1280;
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    const targetWidth = Math.round(video.videoWidth * scale);
    const targetHeight = Math.round(video.videoHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(targetWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    this.cameraCapturedPreview = canvas.toDataURL('image/jpeg', 0.85);
    this.stopCameraStream();
  }

  async retakeCameraPhoto(): Promise<void> {
    this.cameraCapturedPreview = null;
    await this.startCameraStream();
  }

  confirmCapturedPhoto(): void {
    if (!this.cameraCapturedPreview) return;

    const archivo = this.dataUrlToFile(this.cameraCapturedPreview);
    if (!archivo) {
      this.cameraError = 'No se pudo procesar la foto capturada.';
      return;
    }
    this.subirArchivo(archivo, true);
  }

  closeCameraModal(): void {
    this.cameraModalOpen = false;
    this.stopCameraStream();
    this.cameraCapturedPreview = null;
  }

  private stopCameraStream(): void {
    if (!this.cameraStream) return;

    this.cameraStream.getTracks().forEach(track => track.stop());
    this.cameraStream = null;
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];

    this.subirArchivo(archivo);

    input.value = '';
  }

  private subirArchivo(archivo: File, desdeCamara = false): void {
    if (archivo.size > 5 * 1024 * 1024) {
      const mensaje = 'La imagen no debe pesar más de 5MB';
      if (desdeCamara) {
        this.cameraError = `${mensaje}. Intenta de nuevo con mejor iluminación o menor resolución.`;
      } else {
        alert(mensaje);
      }
      return;
    }

    const raw = sessionStorage.getItem('usuario');
    const matricula = raw ? JSON.parse(raw)?.matricula : null;

    if (!matricula) {
      const mensaje = 'No se encontró la matrícula en sesión. Inicia sesión de nuevo.';
      if (desdeCamara) {
        this.cameraError = mensaje;
      } else {
        alert(mensaje);
      }
      return;
    }

    if (!this.esMatriculaEgresado(matricula)) {
      const mensaje = 'La foto de perfil en este modulo solo aplica para cuentas de egresado.';
      if (desdeCamara) {
        this.cameraError = mensaje;
      } else {
        alert(mensaje);
      }
      return;
    }

    this.perfilService.subirFotoPerfil(matricula, archivo).subscribe({
      next: (resp) => {
        // Some backends return only a message on upload. Re-read profile to get urlFoto safely.
        this.perfilService.obtenerPerfil(matricula).subscribe({
          next: (perfil) => {
            const rutaFoto = perfil?.urlFoto || resp?.urlFoto || resp?.fotoUrl || resp?.url || resp?.path;
            if (!rutaFoto) {
              const mensaje = 'La foto se subio, pero no se pudo obtener la ruta de la imagen.';
              if (desdeCamara) {
                this.cameraError = mensaje;
              } else {
                alert(mensaje);
              }
              return;
            }

            const nuevaUrl = this.normalizarUrlFoto(rutaFoto);
            this.perfilService.setFoto(nuevaUrl);
            this.fotoGlobal = nuevaUrl;
            this.mostrarPanelFoto = false;
            if (desdeCamara) {
              this.closeCameraModal();
            }
          },
          error: () => {
            const rutaFoto = resp?.urlFoto || resp?.fotoUrl || resp?.url || resp?.path;
            if (!rutaFoto) {
              const mensaje = 'La foto se subio, pero no se pudo refrescar el perfil.';
              if (desdeCamara) {
                this.cameraError = mensaje;
              } else {
                alert(mensaje);
              }
              return;
            }

            const nuevaUrl = this.normalizarUrlFoto(rutaFoto);
            this.perfilService.setFoto(nuevaUrl);
            this.fotoGlobal = nuevaUrl;
            this.mostrarPanelFoto = false;
            if (desdeCamara) {
              this.closeCameraModal();
            }
          }
        });
      },
      error: (err) => {
        console.error('Error al subir foto:', err);
        const mensajeBackend =
          err?.error?.message ||
          err?.error?.mensaje ||
          err?.message ||
          '';
        const mensaje = mensajeBackend
          ? `Error al subir la foto: ${mensajeBackend}`
          : 'Error al subir la foto. Intenta nuevamente.';
        if (desdeCamara) {
          this.cameraError = mensaje;
        } else {
          alert(mensaje);
        }
      }
    });
  }

  private actualizarEstadoLayout(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    this.esLogin = cleanUrl === '/login';
    this.esAdmin = cleanUrl.startsWith('/admin');
  }

  private dataUrlToFile(dataUrl: string): File | null {
    const [meta, payload] = dataUrl.split(',');
    if (!meta || !payload) return null;

    const mimeMatch = /data:(.*?);base64/.exec(meta);
    const mimeType = mimeMatch?.[1] || 'image/jpeg';
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    const filename = `foto-perfil-${Date.now()}.${extension}`;

    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new File([bytes], filename, { type: mimeType });
  }

  private normalizarUrlFoto(url: string): string {
    if (!url) return this.fotoGlobal;
    const cacheBust = `t=${Date.now()}`;
    if (/^(https?:|data:|blob:)/i.test(url)) {
      return `${url}${url.includes('?') ? '&' : '?'}${cacheBust}`;
    }

    const ruta = url.startsWith('/') ? url : `/${url}`;
    return `${this.backendOrigin}${ruta}${ruta.includes('?') ? '&' : '?'}${cacheBust}`;
  }
  
  calcularProgreso() {
  const raw = sessionStorage.getItem('usuario');

  if (!raw) return;

  const usuario = JSON.parse(raw);
  const matricula = usuario.matricula;
  if (!this.esMatriculaEgresado(matricula)) return;

  let completados = 0;
  const total = 7;

  this.http.get<any>(`/egresados/${matricula}`)
    .subscribe({
      next: (data: any) => {
        if (
          data?.nombre &&
          data?.apellidoPaterno &&
          data?.apellidoMaterno &&
          data?.campus &&
          data?.generacion
        ) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any>(`/egresados/contacto/${matricula}`)
    .subscribe({
      next: (data: any) => {
        if (data?.correoPersonal && data?.telefono) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any>(`/egresados/academico/${matricula}`)
    .subscribe({
      next: (data: any) => {
        if (data?.claveCarrera) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any[]>(`/egresado/laboral/${matricula}`)
    .subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any[]>(`/egresado/posgrado/${matricula}`)
    .subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any[]>(`/egresado/certificaciones/${matricula}`)
    .subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any[]>(`/egresado/reconocimientos/${matricula}`)
    .subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });
}

actualizarPorcentaje(completados: number, total: number) {
  this.porcentajePerfil = Math.round((completados / total) * 100);
}

private esMatriculaEgresado(matricula: string): boolean {
  return /^\d+$/.test(String(matricula || '').trim());
}
  
}
