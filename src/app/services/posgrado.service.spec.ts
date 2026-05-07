import { TestBed } from '@angular/core/testing';

import { PosgradoService } from './posgrado.service';

describe('PosgradoService', () => {
  let service: PosgradoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosgradoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
