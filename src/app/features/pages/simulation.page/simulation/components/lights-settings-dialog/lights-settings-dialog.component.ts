import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSliderModule } from "@angular/material/slider";
import { LightSettingsService } from "src/app/features/pages/simulation.page/simulation/components/lights-settings-dialog/light-settings.service";
import { SimConfigControlService } from "src/app/features/pages/simulation.page/simulation/services/sim-config-control.service";

@Component({
	selector: "app-lights-settings-dialog",
	standalone: true,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatInputModule,
		MatIconModule,
		ReactiveFormsModule,
		MatSliderModule,
	],
	templateUrl: "./lights-settings-dialog.component.html",
	styleUrl: "./lights-settings-dialog.component.scss",
})
export class LightsSettingsDialogComponent {
  protected lightSettingsSvc = inject(LightSettingsService);
}
