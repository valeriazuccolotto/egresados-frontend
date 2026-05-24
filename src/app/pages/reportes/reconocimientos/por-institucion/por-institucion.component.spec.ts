import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorInstitucionComponent } from './por-institucion.component';

describe('PorInstitucionComponent', () => {
  let component: PorInstitucionComponent;
  let fixture: ComponentFixture<PorInstitucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PorInstitucionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PorInstitucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
