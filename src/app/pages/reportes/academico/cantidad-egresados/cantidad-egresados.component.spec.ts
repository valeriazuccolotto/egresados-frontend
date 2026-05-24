import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CantidadEgresadosComponent } from './cantidad-egresados.component';

describe('CantidadEgresadosComponent', () => {
  let component: CantidadEgresadosComponent;
  let fixture: ComponentFixture<CantidadEgresadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CantidadEgresadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CantidadEgresadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
