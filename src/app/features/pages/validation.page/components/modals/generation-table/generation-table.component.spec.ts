import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GenerationTableComponent } from "./generation-table.component";

describe('GenerationTableComponent', () => {
  let component: GenerationTableComponent;
  let fixture: ComponentFixture<GenerationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
