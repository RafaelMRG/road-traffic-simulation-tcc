import { Component, inject, OnInit } from "@angular/core";
import { AbstractControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSliderModule } from "@angular/material/slider";
import {
	OptimizationSettingsService
} from "src/app/features/pages/simulation.page/simulation/components/optimization-dialog/optimization-settings.service";
import { MatOption, MatSelect } from "@angular/material/select";

@Component({
	selector: "app-optimization-dialog",
	standalone: true,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatInputModule,
		MatIconModule,
		ReactiveFormsModule,
		MatSliderModule,
		MatSelect,
		MatOption
	],
	templateUrl: "./optimization-dialog.component.html",
	styleUrl: "./optimization-dialog.component.scss",
})
export class OptimizationDialogComponent implements OnInit {
	protected optimizationSettingsSvc = inject(OptimizationSettingsService);

	ngOnInit() {
		this.optimizationSettingsSvc.optimizationStopCriteria.get('maxGenerations')?.setValidators([this.validateRange.bind(this)]);
		this.optimizationSettingsSvc.optimizationStopCriteria.get('minGenerations')?.setValidators([this.validateRange.bind(this)]);
	}

	validateRange(_control: AbstractControl): { [key: string]: boolean } | null {
		const min = this.optimizationSettingsSvc.optimizationStopCriteria.get('minGenerations')?.value ?? 0;
		const max = this.optimizationSettingsSvc.optimizationStopCriteria.get('maxGenerations')?.value ?? 0;
		console.log(min, max)

		if (max < min) {
			return { invalidRange: true };
		}

		return null;
	}

}
