import { Component } from "@angular/core";
import { SimulationTableComponent } from "./components/modals/simulation-table/simulation-table.component";

@Component({
  selector: 'app-validation.page',
  standalone: true,
  imports: [SimulationTableComponent],
  templateUrl: './validation.page.component.html',
  styleUrl: './validation.page.component.scss'
})
export class ValidationPageComponent {

}
