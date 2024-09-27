import { Component, Inject } from "@angular/core";
import {
	MAT_DIALOG_DATA, MatDialog,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogTitle
} from "@angular/material/dialog";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { DatePipe } from "@angular/common";
import { RoadCrossing } from "../../../../simulation.page/simulation/services/backend-models";
import { BestSemaphoreVisualComponent } from "../best-semaphore-visual/best-semaphore-visual.component";

@Component({
  selector: 'app-citizen-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle, DatePipe],
  templateUrl: './citizen-table.component.html',
  styleUrl: './citizen-table.component.scss'
})
export class CitizenTableComponent {
  displayedColumns: string[] = ['row', 'citizenId','duration', 'tripAvg', 'occupationRate', 'vehiclesTotal', 'averageSpeed', 'createdAt', 'openSem'];
  dataSource = new MatTableDataSource(this.data);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog) {
  }

	openRoadCrossings(roadCrossing: RoadCrossing[]) {
	  this.dialog.open(BestSemaphoreVisualComponent, {
		  data: roadCrossing,
		  width: '60vw',
		  height: '55vh',
	  })
	}

}
