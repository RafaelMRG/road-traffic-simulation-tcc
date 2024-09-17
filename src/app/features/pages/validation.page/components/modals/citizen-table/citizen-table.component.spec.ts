import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitizenTableComponent } from './citizen-table.component';

describe('CitizenTableComponent', () => {
  let component: CitizenTableComponent;
  let fixture: ComponentFixture<CitizenTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitizenTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CitizenTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
