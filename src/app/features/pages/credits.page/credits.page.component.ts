import { Component, inject} from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SnackbarService } from 'src/app/features/services/snackbar.service';

@Component({
  selector: 'app-credits.page',
  standalone: true,
  imports: [MatSlideToggleModule],
  templateUrl: './credits.page.component.html',
  styleUrl: './credits.page.component.scss'
})
export class CreditsPageComponent {

  snackbarService = inject(SnackbarService);

  checado: boolean = false;
  
} 
