import { inject, Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import {
	GenerationLights,
	GenerationResult,
	GenerationResults,
	SimConfiguration
} from "src/app/features/pages/simulation.page/simulation/services/models";
import { SimCommsService } from "src/app/features/pages/simulation.page/simulation/services/sim-comms.service";

@Injectable({
	providedIn: "root"
})
export class SimConfigControlService {
	constructor() {
	}

	private simCommsSvc = inject(SimCommsService);

	/**
	 * 1-index based
	 *
	 * @type {number}
	 */
	currentPopulation = 1;
	currentGeneration = 1;
	simulationId?: number;
	isAutomatedSimulation = false;
	results: GenerationResults = [];
	optimizationLightCfg: GenerationLights = [];

	addResult(result: GenerationResult) {
		this.results.push(
			{
				...result,
				lights: this.simConfig.lightsConfig
			}
		);
	}

	resetConfig() {
		this.isAutomatedSimulation = false;
	}

	simConfig: SimConfiguration = {
		population: 6,
		simulatedTime: 60,
		mutationRate: 0.3,
		selecteds: 2,
		maxGenerations: 0,
		minGenerations: 0,
		avgTimeDelta: 0,
		lightsConfig: [
			{ cycleStartTime: 0, greenDuration: 30, redDuration: 30 },
			{ cycleStartTime: 15, greenDuration: 30, redDuration: 30 },
			{ cycleStartTime: 30, greenDuration: 30, redDuration: 30 }
		],
		slidersPatch: {
			trafficControl: {
				mainInflow: 4000,
				secondaryInflow: 0,
				percentRight: 15,
				percentLeft: 0,
				timelapse: 10
			},
			carFollowingControl: {
				maxSpeed: 60,
				timeGap: 0.3,
				maxAccel: 2
			}
		}
	};

	updateSliders() {
		const data = [
			this.trafficControl.getRawValue(),
			this.carFollowingControl.getRawValue()
		];
		this.simCommsSvc.postMessage({
			type: "function",
			data,
			functionName: "setSliders"
		});
	}

	// <Controle de inputs>
	trafficControl = new FormGroup(this.getPredefinedSlidersFg().trafficControl);

	carFollowingControl = new FormGroup(
		this.getPredefinedSlidersFg().carFollowingControl
	);

	getPredefinedSlidersFg() {
		const tc = this.simConfig.slidersPatch.trafficControl;
		const cf = this.simConfig.slidersPatch.carFollowingControl;
		return {
			trafficControl: {
				mainInflow: new FormControl<number>(tc.mainInflow),
				secondaryInflow: new FormControl<number>(tc.secondaryInflow),
				percentRight: new FormControl<number>(tc.percentRight),
				percentLeft: new FormControl<number>(tc.percentLeft),
				timelapse: new FormControl<number>(tc.timelapse)
			},
			carFollowingControl: {
				maxSpeed: new FormControl<number>(cf.maxSpeed),
				timeGap: new FormControl<number>(cf.timeGap),
				maxAccel: new FormControl<number>(cf.maxAccel)
			}
		};
	}

	// </Controle de inputs>
}
