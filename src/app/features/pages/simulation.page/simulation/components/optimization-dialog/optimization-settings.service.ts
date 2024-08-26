import { inject, Injectable } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { GenerationResults, SimConfiguration } from "src/app/features/pages/simulation.page/simulation/services/models";
import { SimConfigControlService } from "src/app/features/pages/simulation.page/simulation/services/sim-config-control.service";
import { SimService } from "src/app/features/pages/simulation.page/simulation/services/sim.service";

@Injectable({
	providedIn: "root",
})
export class OptimizationSettingsService {
	constructor() {
		this.setStartingParams();
	}

	private simConfSvc = inject(SimConfigControlService);
	private simSvc = inject(SimService);

	public readonly LIMITS = {
		simulatedTime: {
			min: 60,
			max: 360,
			default: 240,
		},
		population: {
			max: 12,
			min: 5,
			default: 6,
		},
		mutationRate: {
			max: 1,
			min: 0,
			default: 0.3,
		},
		selecteds: {
			max: 6,
			min: 2,
			default: 2,
		},
	} as const;

	public runSettings = new FormGroup({
		simulatedTime: new FormControl<number>(
			this.LIMITS.simulatedTime.default,
			[
				Validators.min(this.LIMITS.simulatedTime.min),
				Validators.max(this.LIMITS.simulatedTime.max),
			]
		),
		population: new FormControl<number>(this.LIMITS.population.default, [
			Validators.min(this.LIMITS.population.min),
			Validators.max(this.LIMITS.population.max),
		]),
		mutationRate: new FormControl<number>(this.LIMITS.mutationRate.default, [
			Validators.max(this.LIMITS.mutationRate.max),
			Validators.min(this.LIMITS.mutationRate.min),
		]),
		selecteds: new FormControl<number>(this.LIMITS.selecteds.default, [
			Validators.max(this.LIMITS.selecteds.max),
			Validators.min(this.LIMITS.selecteds.min),
		]),
	});

	startSimulation() {
		this.setStartingParams();
		this.simSvc.startSimulation();
	}

	private setStartingParams() {
		const data = this.runSettings.getRawValue();
		this.simConfSvc.simConfig = {
			...this.simConfSvc.simConfig,
			...data,
		} as SimConfiguration;
	}

}
