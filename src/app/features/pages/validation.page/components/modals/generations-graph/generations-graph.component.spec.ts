import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GenerationsGraphComponent } from "./generations-graph.component";

describe('GenerationsGraphComponent', () => {
  let component: GenerationsGraphComponent;
  let fixture: ComponentFixture<GenerationsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationsGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerationsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
