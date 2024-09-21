import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { Simulation } from "../../../../simulation.page/simulation/services/backend-models";
import { MatTable, MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { GenerationTableComponent } from "../generation-table/generation-table.component";
import { MatButtonModule } from "@angular/material/button";
import { ApiRequestsService } from "../../../../simulation.page/simulation/services/api/api-requests.service";
import { MatProgressBar } from "@angular/material/progress-bar";
import { DatePipe } from "@angular/common";

@Component({
	selector: "app-simulation-table",
	standalone: true,
	imports: [
		MatTableModule,
		MatButtonModule,
		MatProgressBar,
		DatePipe
	],
	templateUrl: "./simulation-table.component.html",
	styleUrl: "./simulation-table.component.scss"
})
export class SimulationTableComponent implements OnInit {
	api: ApiRequestsService = inject(ApiRequestsService);
	lastUpdated?: Date;

	@ViewChild('table') table?: MatTable<any>;

	ngOnInit() {
		this.api.getAllSimulations()
			.then(
				(sims: Simulation[]) => {
					this.dataSource = new MatTableDataSource(sims);
				})
			.catch(() => this.showError = true)
			.finally(() => this.lastUpdated = new Date());
	}

	updateTable(){
		this.table?.renderRows();
	}

	showError = false;

	displayedColumns: string[] = ["simulationId", "selecteds", "mutationRate", "population", "avgTimeDelta", "maxGenerations", "minGenerations", "actions", "createdAt"];
	dataSource?: MatTableDataSource<Simulation>;

	constructor(public dialog: MatDialog) {
	}

	openGenerations(simulation: Simulation) {
		this.dialog.open(GenerationTableComponent, {
			data: simulation.generations,
			height: "80vh",
			width: "85vw"
		});
	}
}
