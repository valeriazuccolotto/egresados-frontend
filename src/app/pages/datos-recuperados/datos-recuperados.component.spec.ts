import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosRecuperadosComponent } from './datos-recuperados.component';

describe('DatosRecuperadosComponent', () => {
  let component: DatosRecuperadosComponent;
  let fixture: ComponentFixture<DatosRecuperadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosRecuperadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatosRecuperadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
