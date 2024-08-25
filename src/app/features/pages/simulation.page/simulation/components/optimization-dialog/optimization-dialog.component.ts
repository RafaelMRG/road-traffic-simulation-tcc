import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSliderModule } from "@angular/material/slider";
import { OptimizationSettingsService } from "src/app/features/pages/simulation.page/simulation/components/optimization-dialog/optimization-settings.service";

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
	],
	templateUrl: "./optimization-dialog.component.html",
	styleUrl: "./optimization-dialog.component.scss",
})
export class OptimizationDialogComponent {
	protected optimizationSettingsSvc = inject(OptimizationSettingsService);
}
