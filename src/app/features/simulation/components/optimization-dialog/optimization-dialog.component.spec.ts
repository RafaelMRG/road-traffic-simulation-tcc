import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptimizationDialogComponent } from './optimization-dialog.component';

describe('OptimizationDialogComponent', () => {
  let component: OptimizationDialogComponent;
  let fixture: ComponentFixture<OptimizationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptimizationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OptimizationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
