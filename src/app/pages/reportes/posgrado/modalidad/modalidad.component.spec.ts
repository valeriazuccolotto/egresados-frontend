import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalidadPosgradoComponent } from './modalidad.component';

describe('ModalidadPosgradoComponent', () => {
  let component: ModalidadPosgradoComponent;
  let fixture: ComponentFixture<ModalidadPosgradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalidadPosgradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalidadPosgradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
