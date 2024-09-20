import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from "@angular/material/dialog";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-citizen-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle, DatePipe],
  templateUrl: './citizen-table.component.html',
  styleUrl: './citizen-table.component.scss'
})
export class CitizenTableComponent {
  displayedColumns: string[] = ['row', 'citizenId','duration', 'tripAvg', 'occupationRate', 'vehiclesTotal', 'averageSpeed', 'createdAt'];
  dataSource = new MatTableDataSource(this.data);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

}
