import { TestBed } from '@angular/core/testing';

import { HakParserService } from './hak-parser.service';

describe('HakParserService', () => {
  let service: HakParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HakParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
