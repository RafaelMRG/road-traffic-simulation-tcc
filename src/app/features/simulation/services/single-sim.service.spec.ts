import { TestBed } from '@angular/core/testing';

import { SingleSimService } from './single-sim.service';

describe('SingleSimService', () => {
  let service: SingleSimService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SingleSimService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
