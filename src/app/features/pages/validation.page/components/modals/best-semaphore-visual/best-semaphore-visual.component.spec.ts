import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestSemaphoreVisualComponent } from './best-semaphore-visual.component';

describe('BestSemaphoreVisualComponent', () => {
  let component: BestSemaphoreVisualComponent;
  let fixture: ComponentFixture<BestSemaphoreVisualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestSemaphoreVisualComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BestSemaphoreVisualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
