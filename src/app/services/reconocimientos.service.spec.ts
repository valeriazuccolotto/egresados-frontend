import { TestBed } from '@angular/core/testing';

import { ReconocimientosService } from './reconocimientos.service';

describe('ReconocimientosService', () => {
  let service: ReconocimientosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReconocimientosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
