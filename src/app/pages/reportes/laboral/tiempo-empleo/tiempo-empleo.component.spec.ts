import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiempoEmpleoComponent } from './tiempo-empleo.component';

describe('TiempoEmpleoComponent', () => {
  let component: TiempoEmpleoComponent;
  let fixture: ComponentFixture<TiempoEmpleoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiempoEmpleoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiempoEmpleoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
