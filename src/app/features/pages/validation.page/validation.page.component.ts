import { Component } from '@angular/core';
import { ResultsComponent } from 'src/app/features/pages/simulation.page/simulation/components/results/results.component';
import { SimulationTableComponent } from "./components/modals/simulation-table/simulation-table.component";

@Component({
  selector: 'app-validation.page',
  standalone: true,
  imports: [ResultsComponent, SimulationTableComponent],
  templateUrl: './validation.page.component.html',
  styleUrl: './validation.page.component.scss'
})
export class ValidationPageComponent {

}
