import { Component } from "@angular/core";
import { MatList, MatListItem, MatListModule } from "@angular/material/list";

@Component({
	selector: "app-credits.page",
	standalone: true,
	imports: [
		MatListModule,
	],
	templateUrl: "./credits.page.component.html",
	styleUrl: "./credits.page.component.scss"
})
export class CreditsPageComponent {


	protected credits = [
		[["https://www.traffic-simulation.de/"], ["Martin Treiber ©"]],
		[["Angular"], ["Google ©"]],
		[["Angular Material"], ["Google LLC ©"]],
		[["Chart.js"], ["chartjs ©"]],
		[["Bootstrap"], ["Bootstrap"]],
		[["FastAPI"], ["@tiangolo ©"]],
		[["SQLite"], ["SQLite consortium"]],
		[["Pydantic"], [""]],
		[["SQLAlchemy"], ["Michael Bayer"]],
	];
} 
