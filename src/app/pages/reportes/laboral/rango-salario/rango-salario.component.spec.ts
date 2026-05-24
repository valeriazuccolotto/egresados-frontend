import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangoSalarioComponent } from './rango-salario.component';

describe('RangoSalarioComponent', () => {
  let component: RangoSalarioComponent;
  let fixture: ComponentFixture<RangoSalarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangoSalarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangoSalarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
