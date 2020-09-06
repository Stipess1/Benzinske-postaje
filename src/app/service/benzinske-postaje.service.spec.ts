import { TestBed } from '@angular/core/testing';

import { BenzinskePostajeService } from './benzinske-postaje.service';

describe('BenzinskePostajeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BenzinskePostajeService = TestBed.get(BenzinskePostajeService);
    expect(service).toBeTruthy();
  });
});
