import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoTitulacionComponent } from './tipo-titulacion.component';

describe('TipoTitulacionComponent', () => {
  let component: TipoTitulacionComponent;
  let fixture: ComponentFixture<TipoTitulacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoTitulacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoTitulacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
