import { TestBed } from '@angular/core/testing';

import { SimService } from './sim.service';

describe('MultiSimService', () => {
  let service: SimService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
