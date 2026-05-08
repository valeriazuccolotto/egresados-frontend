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

  fotoGlobal: string = 'assets/default-user.png';

  constructor(
  private perfilService: PerfilService,
  private router: Router,
  private http: HttpClient
) {
  this.esLogin = this.router.url === '/login';

  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.esLogin = event.urlAfterRedirects === '/login';

      if (!this.esLogin) {
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

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.cameraCapturedPreview = canvas.toDataURL('image/jpeg', 0.92);
    this.stopCameraStream();
  }

  async retakeCameraPhoto(): Promise<void> {
    this.cameraCapturedPreview = null;
    await this.startCameraStream();
  }

  confirmCapturedPhoto(): void {
    if (!this.cameraCapturedPreview) return;

    const archivo = this.dataUrlToFile(
      this.cameraCapturedPreview,
      `foto-perfil-${Date.now()}.jpg`
    );

    this.subirArchivo(archivo);
    this.closeCameraModal();
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

  private subirArchivo(archivo: File): void {
    if (archivo.size > 5 * 1024 * 1024) {
      alert('La imagen no debe pesar más de 5MB');
      return;
    }

    const matricula = localStorage.getItem('matricula') || '21010048';

    this.perfilService.subirFotoPerfil(matricula, archivo).subscribe({
      next: (resp) => {
        const nuevaUrl = `http://localhost:8189${resp.urlFoto}?t=${Date.now()}`;

        this.perfilService.setFoto(nuevaUrl);
        this.fotoGlobal = nuevaUrl;
        this.mostrarPanelFoto = false;
      },
      error: (err) => {
        console.error('Error al subir foto:', err);
        alert('Error al subir la foto');
      }
    });
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const [meta, payload] = dataUrl.split(',');
    const mimeMatch = /data:(.*?);base64/.exec(meta);
    const mimeType = mimeMatch?.[1] || 'image/jpeg';

    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new File([bytes], filename, { type: mimeType });
  }
  
  calcularProgreso() {
  const raw = sessionStorage.getItem('usuario');

  if (!raw) return;

  const usuario = JSON.parse(raw);
  const matricula = usuario.matricula;

  let completados = 0;
  const total = 7;

  this.http.get<any>(`http://localhost:8189/egresados/${matricula}`)
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

  this.http.get<any>(`http://localhost:8189/egresados/contacto/${matricula}`)
    .subscribe({
      next: (data: any) => {
        if (data?.correoPersonal && data?.telefono) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any>(`http://localhost:8189/egresados/academico/${matricula}`)
    .subscribe({
      next: (data: any) => {
        if (data?.claveCarrera) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any[]>(`http://localhost:8189/egresado/laboral/${matricula}`)
    .subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any[]>(`http://localhost:8189/egresado/posgrado/${matricula}`)
    .subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any[]>(`http://localhost:8189/egresado/certificaciones/${matricula}`)
    .subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          completados++;
        }

        this.actualizarPorcentaje(completados, total);
      },
      error: () => this.actualizarPorcentaje(completados, total)
    });

  this.http.get<any[]>(`http://localhost:8189/egresado/reconocimientos/${matricula}`)
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
  
}
