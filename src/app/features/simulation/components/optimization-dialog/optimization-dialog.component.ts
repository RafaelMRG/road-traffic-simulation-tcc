import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSliderModule } from "@angular/material/slider";
import { SimConfigControlService } from "src/app/features/simulation/services/sim-config-control.service";
import { SimService } from "src/app/features/simulation/services/sim.service";

@Component({
	selector: "app-optimization-dialog",
	standalone: true,
	imports: [
		MatDialogModule,
		MatButtonModule,
		MatInputModule,
		MatIconModule,
		ReactiveFormsModule,
		MatDividerModule,
		MatSliderModule,
	],
	templateUrl: "./optimization-dialog.component.html",
	styleUrl: "./optimization-dialog.component.scss",
})
export class OptimizationDialogComponent {

  private simConfSvc = inject(SimConfigControlService);
  private simSvc = inject(SimService);
  
	protected runSettings = new FormGroup({
		simulatedTime: new FormControl<number>(240),
		iterations: new FormControl<number>(4),
		semaphore1RedDuration: new FormControl<number>(30),
		semaphore1GreenDuration: new FormControl<number>(30),
		semaphore1CycleStartTime: new FormControl<number>(0),
		semaphore2RedDuration: new FormControl<number>(30),
		semaphore2GreenDuration: new FormControl<number>(30),
		semaphore2CycleStartTime: new FormControl<number>(0),
		semaphore3RedDuration: new FormControl<number>(30),
		semaphore3GreenDuration: new FormControl<number>(30),
		semaphore3CycleStartTime: new FormControl<number>(0),
	});

  startSimulation(){
    this.setStartingParams();
    this.simSvc.startSimulation();
  }


  setStartingParams(){
    const sem1 = this.simConfSvc.simConfig.lightsConfig[0]
    const sem2 = this.simConfSvc.simConfig.lightsConfig[1]
    const sem3 = this.simConfSvc.simConfig.lightsConfig[2]
    const data = this.runSettings.getRawValue();
    sem1.cycleStartTime = data.semaphore1CycleStartTime ?? 0;
    sem1.redDuration = data.semaphore1RedDuration ?? 30;
    sem1.greenDuration = data.semaphore1GreenDuration ?? 30;

    sem2.cycleStartTime = data.semaphore2CycleStartTime ?? 0;
    sem2.redDuration = data.semaphore2RedDuration ?? 30;
    sem2.greenDuration = data.semaphore2GreenDuration ?? 30;

    sem3.cycleStartTime = data.semaphore3CycleStartTime ?? 0;
    sem3.redDuration = data.semaphore3RedDuration ?? 30;
    sem3.greenDuration = data.semaphore3GreenDuration ?? 30;
    
    this.simConfSvc.simConfig.iterations = data.iterations ?? 4;
    this.simConfSvc.simConfig.simulatedTime = data.simulatedTime ?? 240
  }
}
