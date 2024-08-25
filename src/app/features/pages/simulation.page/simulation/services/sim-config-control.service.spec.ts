import { TestBed } from '@angular/core/testing';

import { SimConfigControlService } from './sim-config-control.service';

describe('SimConfigControlService', () => {
  let service: SimConfigControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimConfigControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
