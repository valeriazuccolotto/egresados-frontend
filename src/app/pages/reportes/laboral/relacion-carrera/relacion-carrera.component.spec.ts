import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelacionCarreraComponent } from './relacion-carrera.component';

describe('RelacionCarreraComponent', () => {
  let component: RelacionCarreraComponent;
  let fixture: ComponentFixture<RelacionCarreraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelacionCarreraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelacionCarreraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
