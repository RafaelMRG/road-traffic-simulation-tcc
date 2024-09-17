import { AfterViewInit, Component, Inject } from "@angular/core";
import { GenerationBestTimePipe } from "../generation-table/generation-best-time.pipe";
import { MatButton } from "@angular/material/button";
import { MatTable } from "@angular/material/table";
import { MatIcon } from "@angular/material/icon";
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogClose,
	MatDialogContent,
	MatDialogTitle
} from "@angular/material/dialog";
import { Generation } from "../../../../simulation.page/simulation/services/backend-models";
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-generations-graph',
  standalone: true,
	imports: [
		GenerationBestTimePipe,
		MatButton,
		MatIcon,
		MatTable,
		MatDialogContent,
		MatDialogActions,
		MatDialogClose,
		MatDialogTitle
	],
  templateUrl: './generations-graph.component.html',
  styleUrl: './generations-graph.component.scss'
})
export class GenerationsGraphComponent implements AfterViewInit {
	constructor(@Inject(MAT_DIALOG_DATA) public data: Generation[]) {
		const bestExtractor = new GenerationBestTimePipe();
		this.graphValues = data.map(g => bestExtractor.transform(g.citizens))
	}

	ngAfterViewInit() {
		this.createLineChart();
	}

	graphValues!: number[];

	createLineChart(): void {
		const ctx = document.getElementById('generationChart') as HTMLCanvasElement;

		new Chart(ctx, {
			type: 'line',
			data: {
				// Since we're passing an array of numbers, we'll just use index labels (0, 1, 2, etc.)
				labels: this.graphValues.map((_: number, index: number) => (index + 1).toString()),
				datasets: [{
					label: 'Tempo médio de viagem',
					data: this.graphValues,
					borderColor: '#3f51b5', // Line color
					backgroundColor: '#3f51b5bb', // Background color below the line
					fill: true,
					tension: 0.4, // Controls the smoothness of the line
					borderWidth: 2,
					pointRadius: 6, // Increase the size of data point dots
					pointHoverRadius: 8, // Larger radius when hovering
					pointBackgroundColor: '#40007a', // Color of the data points
					pointBorderColor: '#3f51b5' // Border color around data points
				}]
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: true, // Ensures the Y-axis starts at 0
						title: {
							display: true,
							text: 'Tempo médio de viagem' // Optional: add a Y-axis label
						}
					},
					x: {
						title: {
							display: true,
							text: 'Geração' // Optional: add an X-axis label
						}
					}
				}
			}
		});
	}

}
