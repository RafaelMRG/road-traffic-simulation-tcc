import { Component, inject, OnInit } from "@angular/core";
import { Simulation } from "../../../../simulation.page/simulation/services/backend-models";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { GenerationTableComponent } from "../generation-table/generation-table.component";
import { MatButtonModule } from "@angular/material/button";
import { ApiRequestsService } from "../../../../simulation.page/simulation/services/api/api-requests.service";
import { MatProgressBar } from "@angular/material/progress-bar";

@Component({
	selector: "app-simulation-table",
	standalone: true,
	imports: [
		MatTableModule,
		MatButtonModule,
		MatProgressBar
	],
	templateUrl: "./simulation-table.component.html",
	styleUrl: "./simulation-table.component.scss"
})
export class SimulationTableComponent implements OnInit {
	api: ApiRequestsService = inject(ApiRequestsService);

	ngOnInit() {
		this.api.getAllSimulations()
			.then(
				(sims: Simulation[]) => {
					this.dataSource = new MatTableDataSource(sims);
				})
			.catch(() => this.showError = true);
	}

	showError = false;

	displayedColumns: string[] = ["selecteds", "mutation_rate", "population", "avg_time_delta", "max_generations", "min_generations", "actions"];
	dataSource?: MatTableDataSource<Simulation>;

	constructor(public dialog: MatDialog) {
	}

	openGenerations(simulation: Simulation) {
		this.dialog.open(GenerationTableComponent, {
			data: simulation.generations,
			height: "80vh",
			width: "66vw"
		});
	}
}
