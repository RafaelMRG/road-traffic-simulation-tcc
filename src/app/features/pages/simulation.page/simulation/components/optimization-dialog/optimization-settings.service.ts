import { inject, Injectable } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SimConfigControlService } from 'src/app/features/pages/simulation.page/simulation/services/sim-config-control.service';
import { SimService } from 'src/app/features/pages/simulation.page/simulation/services/sim.service';

@Injectable({
	providedIn: "root",
})
export class OptimizationSettingsService {
	constructor() {
    this.setStartingParams();
  }

	private simConfSvc = inject(SimConfigControlService);
	private simSvc = inject(SimService);

	public runSettings = new FormGroup({
		simulatedTime: new FormControl<number>(240),
		population: new FormControl<number>(4),
	});

	startSimulation() {
		this.setStartingParams();
		this.simSvc.startSimulation();
	}

	private setStartingParams() {
		const data = this.runSettings.getRawValue();
		this.simConfSvc.simConfig.population = data.population ?? 4;
		this.simConfSvc.simConfig.simulatedTime = data.simulatedTime ?? 240;
	}
}
