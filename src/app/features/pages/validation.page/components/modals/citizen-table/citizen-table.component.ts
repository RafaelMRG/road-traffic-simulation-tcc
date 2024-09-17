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

@Component({
  selector: 'app-citizen-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle],
  templateUrl: './citizen-table.component.html',
  styleUrl: './citizen-table.component.scss'
})
export class CitizenTableComponent {
  displayedColumns: string[] = ['duration', 'trip_avg', 'occupation_rate', 'vehicles_total', 'average_speed'];
  dataSource = new MatTableDataSource(this.data);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

}
