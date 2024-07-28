import { Component } from '@angular/core';
import { ResultsComponent } from 'src/app/features/simulation/components/results/results.component';

@Component({
  selector: 'app-validation.page',
  standalone: true,
  imports: [ResultsComponent],
  templateUrl: './validation.page.component.html',
  styleUrl: './validation.page.component.scss'
})
export class ValidationPageComponent {

}
