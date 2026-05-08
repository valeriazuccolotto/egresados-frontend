import { TestBed } from '@angular/core/testing';

import { LaboralService } from './laboral.service';

describe('LaboralService', () => {
  let service: LaboralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LaboralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
