import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import { RoadCrossing } from "../../../../simulation.page/simulation/services/backend-models";
import { NgForOf } from "@angular/common";
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'app-best-semaphore-visual',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    NgForOf,
    MatDialogClose,
    MatButton,
    MatDialogActions
  ],
  templateUrl: './best-semaphore-visual.component.html',
  styleUrl: './best-semaphore-visual.component.scss'
})
export class BestSemaphoreVisualComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data?: RoadCrossing[]){

  }

}
