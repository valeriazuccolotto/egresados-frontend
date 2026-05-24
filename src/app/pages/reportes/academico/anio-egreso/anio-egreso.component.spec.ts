import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnioEgresoComponent } from './anio-egreso.component';

describe('AnioEgresoComponent', () => {
  let component: AnioEgresoComponent;
  let fixture: ComponentFixture<AnioEgresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnioEgresoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnioEgresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
