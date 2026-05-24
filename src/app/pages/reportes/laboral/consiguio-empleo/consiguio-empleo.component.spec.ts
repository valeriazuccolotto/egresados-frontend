import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsiguioEmpleoComponent } from './consiguio-empleo.component';

describe('ConsiguioEmpleoComponent', () => {
  let component: ConsiguioEmpleoComponent;
  let fixture: ComponentFixture<ConsiguioEmpleoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsiguioEmpleoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsiguioEmpleoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
