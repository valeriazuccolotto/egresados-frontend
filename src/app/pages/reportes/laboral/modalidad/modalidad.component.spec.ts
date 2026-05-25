import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalidadLaboralComponent } from './modalidad.component';

describe('ModalidadLaboralComponent', () => {
  let component: ModalidadLaboralComponent;
  let fixture: ComponentFixture<ModalidadLaboralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalidadLaboralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalidadLaboralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
