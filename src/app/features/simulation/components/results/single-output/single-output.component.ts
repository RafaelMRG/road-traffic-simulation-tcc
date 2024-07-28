import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, Input } from '@angular/core';

@Component({
	selector: "app-single-output",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./single-output.component.html",
	styleUrl: "./single-output.component.scss",
})
export class SingleOutputComponent implements AfterViewInit {

	@Input() result: SingleResult = {
		value: 0,
		max: 0,
		min: 0,
		unit: "",
		resultName: "",
	};
	
	rulerWidth = 0;

	ngAfterViewInit(): void {
		setTimeout(() => {
			const r = this.result;
			const range = r.max - r.min;
			const width = (r.value - r.min) / range * 100;
			this.rulerWidth = width;
		}, 20);
	}
}

export type SingleResult = {
	value: number;
	max: number;
	min: number;
	unit: string;
	resultName: string;
}