import { TestBed } from '@angular/core/testing';

import { SimCommsService } from './sim-comms.service';

describe('SimCommsService', () => {
  let service: SimCommsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimCommsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
