import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelacionComponent } from './relacion.component';

describe('RelacionComponent', () => {
  let component: RelacionComponent;
  let fixture: ComponentFixture<RelacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
