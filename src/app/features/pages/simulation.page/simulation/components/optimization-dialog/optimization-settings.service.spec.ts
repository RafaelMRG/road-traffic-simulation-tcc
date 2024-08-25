import { TestBed } from '@angular/core/testing';

import { OptimizationSettingsService } from './optimization-settings.service';

describe('OptimizationSettingsService', () => {
  let service: OptimizationSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptimizationSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
