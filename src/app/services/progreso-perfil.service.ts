import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { EgresadoService } from './egresado.service';

@Injectable({ providedIn: 'root' })
export class ProgresoPerfilService {

  private readonly totalCampos = 21;

  constructor(private egresadoService: EgresadoService) {}

  calcularPorcentaje(matricula: string): Observable<number> {
    const m = (matricula || '').trim();
    if (!m) {
      return of(0);
    }

    return forkJoin({
      perfil: this.egresadoService.getByMatricula(m).pipe(catchError(() => of(null))),
      contacto: this.egresadoService.getContactoPorMatricula(m).pipe(catchError(() => of(null))),
      academico: this.egresadoService.getAcademicoPorMatricula(m).pipe(catchError(() => of(null))),
      laborales: this.egresadoService.getLaboralPorMatricula(m).pipe(catchError(() => of([] as any[])))
    }).pipe(
      map(({ perfil, contacto, academico, laborales }) => {
        let completados = 0;

        if (perfil?.nombre) completados++;
        if (perfil?.apellidoPaterno) completados++;
        if (perfil?.apellidoMaterno) completados++;
        if (perfil?.generacion) completados++;
        if (perfil?.campus) completados++;

        if (contacto?.correoPersonal) completados++;
        if (contacto?.telefono) completados++;
        if (contacto?.ciudad) completados++;
        if (contacto?.estadoResidencia) completados++;

        if (academico?.claveCarrera) completados++;
        if (academico?.promedio !== null && academico?.promedio !== undefined) completados++;
        if (academico?.anioEgreso !== null && academico?.anioEgreso !== undefined) completados++;
        if (academico?.titulado) completados++;
        if (academico?.cedulaProfesional) completados++;

        const laboral = Array.isArray(laborales) && laborales.length > 0 ? laborales[0] : null;
        if (laboral?.empresa) completados++;
        if (laboral?.puesto) completados++;
        if (laboral?.sector) completados++;
        if (laboral?.comoConsiguio) completados++;
        if (laboral?.tiempoConseguir) completados++;
        if (laboral?.tipoContrato) completados++;
        if (laboral?.salario) completados++;

        return Math.round((completados / this.totalCampos) * 100);
      })
    );
  }
}
