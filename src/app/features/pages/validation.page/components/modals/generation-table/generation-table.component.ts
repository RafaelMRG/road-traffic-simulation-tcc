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
import { Generation } from "../../../../simulation.page/simulation/services/backend-models";
import { GenerationBestTimePipe } from "./generation-best-time.pipe";
import { MatIconModule } from "@angular/material/icon";
import { GenerationsGraphComponent } from "../generations-graph/generations-graph.component";
import { DatePipe } from "@angular/common";

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

}
