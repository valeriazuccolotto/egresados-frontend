import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarInfoComponent } from './solicitar-info.component';

describe('SolicitarInfoComponent', () => {
  let component: SolicitarInfoComponent;
  let fixture: ComponentFixture<SolicitarInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
