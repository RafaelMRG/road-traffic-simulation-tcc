import { inject, Injectable } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SimConfigControlService } from 'src/app/features/pages/simulation.page/simulation/services/sim-config-control.service';
import { LightPhasing } from "../../services/models";

@Injectable({
	providedIn: "root",
})
export class LightSettingsService {
	constructor() {
		this.setStartingParams();
	}

	private simConfSvc = inject(SimConfigControlService);

	public runSettings = new FormGroup({
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

	public randomizeLightsParameters() {
		this.runSettings.setValue({
			semaphore1RedDuration: this.getRandomInteger(
				this.RED_MIN,
				this.RED_MAX
			),
			semaphore1GreenDuration: this.getRandomInteger(
				this.GREEN_MIN,
				this.GREEN_MAX
			),
			semaphore1CycleStartTime: this.getRandomInteger(
				this.CYCLE_MIN,
				this.CYCLE_MAX
			),
			semaphore2RedDuration: this.getRandomInteger(
				this.RED_MIN,
				this.RED_MAX
			),
			semaphore2GreenDuration: this.getRandomInteger(
				this.GREEN_MIN,
				this.GREEN_MAX
			),
			semaphore2CycleStartTime: this.getRandomInteger(
				this.CYCLE_MIN,
				this.CYCLE_MAX
			),
			semaphore3RedDuration: this.getRandomInteger(
				this.RED_MIN,
				this.RED_MAX
			),
			semaphore3GreenDuration: this.getRandomInteger(
				this.GREEN_MIN,
				this.GREEN_MAX
			),
			semaphore3CycleStartTime: this.getRandomInteger(
				this.CYCLE_MIN,
				this.CYCLE_MAX
			),
		});
	}

	setOptimizationLights(){
		this.simConfSvc.optimizationLightCfg = this.buildInitialPopulation();
	}

	private buildInitialPopulation() {
		let initialConfig: LightPhasing[][] = []
		for (let i = 0; i < this.simConfSvc.simConfig.population; i++){
			let currentCitizen: LightPhasing[] = []
			for(let j = 0; j < 3; j++) {
				currentCitizen.push(this.getRandomizedLights());
			}
			initialConfig.push(currentCitizen);
		}
		console.log(initialConfig)
		return initialConfig;
	}

	private getRandomizedLights(): LightPhasing {
		return {
				cycleStartTime: this.getRandomInteger(
					this.CYCLE_MIN,
					this.CYCLE_MAX
				),
				greenDuration: this.getRandomInteger(
					this.GREEN_MIN,
					this.GREEN_MAX
				),
				redDuration: this.getRandomInteger(
					this.RED_MIN,
					this.RED_MAX
				),
			}
	}

	setStartingParams() {
		const sem1 = this.simConfSvc.simConfig.lightsConfig[0];
		const sem2 = this.simConfSvc.simConfig.lightsConfig[1];
		const sem3 = this.simConfSvc.simConfig.lightsConfig[2];
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
	}

	public readonly RED_MIN = 30;
	public readonly RED_MAX = 90;
	public readonly GREEN_MIN = 30;
	public readonly GREEN_MAX = 90;
	public readonly CYCLE_MAX = 120;
	public readonly CYCLE_MIN = 30;

	private getRandomInteger(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}
