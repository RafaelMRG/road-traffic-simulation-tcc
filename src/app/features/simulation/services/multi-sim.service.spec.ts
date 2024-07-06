import { TestBed } from '@angular/core/testing';

import { MultiSimService } from './multi-sim.service';

describe('MultiSimService', () => {
  let service: MultiSimService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiSimService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
