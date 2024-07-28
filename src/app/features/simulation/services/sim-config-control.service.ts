import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SimCommsService } from 'src/app/features/simulation/services/sim-comms.service';

@Injectable({
	providedIn: "root",
})
export class SimConfigControlService {
	constructor() {}

  private simCommsSvc = inject(SimCommsService);

	
	/**
	 * 1-index based
	 *
	 * @type {number}
	 */
	currentIteration = 1;
	isAutomatedSimulation = false;

	simConfig: SimConfiguration = {
		iterations: 2,
		simulatedTime: 60,
		lightsConfig: [
			{ cycleStartTime: 0, greenDuration: 30, redDuration: 30 },
			{ cycleStartTime: 15, greenDuration: 30, redDuration: 30 },
			{ cycleStartTime: 30, greenDuration: 30, redDuration: 30 },
		],
		slidersPatch: {
			trafficControl: {
				mainInflow: 2000,
				secondaryInflow: 800,
				percentRight: 15,
				percentLeft: 0,
				timelapse: 10,
			},
			carFollowingControl: {
				maxSpeed: 60,
				timeGap: 1.5,
				maxAccel: 1.5,
			},
		},
	};

	updateSliders() {
		const data = [
			this.trafficControl.getRawValue(),
			this.carFollowingControl.getRawValue(),
		];
		this.simCommsSvc.postMessage({ type: "function", data, functionName: "setSliders" });
	}


	// <Controle de inputs>
	trafficControl = new FormGroup(
		this.getPredefinedSlidersFg().trafficControl
	);

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
				timelapse: new FormControl<number>(tc.timelapse),
			},
			carFollowingControl: {
				maxSpeed: new FormControl<number>(cf.maxSpeed),
				timeGap: new FormControl<number>(cf.timeGap),
				maxAccel: new FormControl<number>(cf.maxAccel),
			},
		};
	}
	// </Controle de inputs>
}



export type SimConfiguration = {
	simulatedTime: number;
	iterations: number;
	slidersPatch: {
		trafficControl: {
			mainInflow: number;
			secondaryInflow: number;
			percentRight: number;
			percentLeft: number;
			timelapse: number;
		};
		carFollowingControl: {
			maxSpeed: number;
			timeGap: number;
			maxAccel: number;
		};
	};
	lightsConfig: LightPhasing[];
};

/**
 * Configuração dos tempos do semáforo de um cruzamento
 *
 * @export
 */
export type LightPhasing = {
	redDuration: number;
	greenDuration: number;
	/**
	 * Offset de início do cíclo do semáforo, utilizado para formar as waves de verde
	 *
	 * @type {number}
	 */
	cycleStartTime: number;
};