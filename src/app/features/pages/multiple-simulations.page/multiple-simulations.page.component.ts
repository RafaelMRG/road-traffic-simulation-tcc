import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NotificationType, SnackbarService } from 'src/app/features/services/snackbar.service';

@Component({
  selector: 'app-multiple-simulations.page',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './multiple-simulations.page.component.html',
  styleUrl: './multiple-simulations.page.component.scss'
})
export class MultipleSimulationsPageComponent {
  constructor(private snackbar: SnackbarService){

  }

  showNotif(type: NotificationType){
    this.snackbar.showNotification('teste', type)
  }
}
