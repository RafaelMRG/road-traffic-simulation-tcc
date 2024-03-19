import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleSimulationsPageComponent } from './multiple-simulations.page.component';

describe('MultipleSimulationsPageComponent', () => {
  let component: MultipleSimulationsPageComponent;
  let fixture: ComponentFixture<MultipleSimulationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleSimulationsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultipleSimulationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
