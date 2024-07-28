import { Component } from '@angular/core';
import { SingleOutputComponent, SingleResult } from 'src/app/features/simulation/components/results/single-output/single-output.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [SingleOutputComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent{

  results: SingleResult[] = [
    {value: 24, max: 60, min: -60, unit: "s", resultName: 'Melhoria de tempo'},
    {value: -20, max: 60, min: -60, unit: "s", resultName: 'Melhoria do semáforo verde'},
    {value: -10, max: 60, min: -60, unit: "s", resultName: 'Melhoria do semáforo vermelho'},
  ]
  
}
