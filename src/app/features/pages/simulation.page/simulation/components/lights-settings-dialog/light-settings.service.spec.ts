import { TestBed } from '@angular/core/testing';

import { LightSettingsService } from './light-settings.service';

describe('LightSettingsService', () => {
  let service: LightSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LightSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
