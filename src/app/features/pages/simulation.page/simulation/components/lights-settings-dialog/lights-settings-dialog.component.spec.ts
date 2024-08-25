import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightsSettingsDialogComponent } from './lights-settings-dialog.component';

describe('LightsSettingsDialogComponent', () => {
  let component: LightsSettingsDialogComponent;
  let fixture: ComponentFixture<LightsSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightsSettingsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LightsSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
