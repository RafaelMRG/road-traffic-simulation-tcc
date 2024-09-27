import { Component, Inject } from "@angular/core";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogTitle
} from "@angular/material/dialog";
import { CitizenTableComponent } from "../citizen-table/citizen-table.component";
import { MatButtonModule } from "@angular/material/button";
import { Citizen, Generation } from "../../../../simulation.page/simulation/services/backend-models";
import { GenerationBestTimePipe } from "./generation-best-time.pipe";
import { MatIconModule } from "@angular/material/icon";
import { GenerationsGraphComponent } from "../generations-graph/generations-graph.component";
import { DatePipe } from "@angular/common";
import { BestSemaphoreVisualComponent } from "../best-semaphore-visual/best-semaphore-visual.component";

@Component({
  selector: 'app-generation-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatDialogContent, MatDialogClose, MatDialogActions, MatDialogTitle, GenerationBestTimePipe, MatIconModule, DatePipe],
  templateUrl: './generation-table.component.html',
  styleUrl: './generation-table.component.scss'
})
export class GenerationTableComponent {
  displayedColumns: string[] = ['row', 'generationId', 'citizens', 'bestTime', 'actions', 'createdAt'];
  dataSource = new MatTableDataSource<Generation>(this.data);
  private bestCitizen?: Citizen;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Generation[], public dialog: MatDialog) {
  }

  openCitizens(citizens: any) {
    this.dialog.open(CitizenTableComponent, {
      data: citizens,
      height: '80vh',
      width: '85vw'
    });
  }

  openGraph(){
    this.dialog.open(GenerationsGraphComponent, {
      data: this.data,
      height: '80vh',
      width: '85vw',
    })
  }

  openBest(){
	  this.setBestCitizen();
	  this.dialog.open(BestSemaphoreVisualComponent, {
		data: this.bestCitizen?.roadCrossings,
		height: '55vh',
		width: '60vw',
	})
  }

  private setBestCitizen(){
	  let bestCitizen: Citizen | undefined = undefined;
	  this.data.forEach((generation) => {
		  generation.citizens.forEach((citizen) => {
			  if (!bestCitizen || citizen.tripAvg < bestCitizen.tripAvg) {
				  bestCitizen = citizen;
			  }
		  });
	  });
	  this.bestCitizen = bestCitizen;
  }
}
