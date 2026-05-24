import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TituladoComponent } from './titulado.component';

describe('TituladoComponent', () => {
  let component: TituladoComponent;
  let fixture: ComponentFixture<TituladoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TituladoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TituladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
