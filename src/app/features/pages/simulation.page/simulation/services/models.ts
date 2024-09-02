export type SimConfiguration = {
	simulatedTime: number; // int
	population: number; // int
	mutationRate: number; // float
	selecteds: number; // int
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

export type LightPhasing = {
	redDuration: number;
	greenDuration: number;
	cycleStartTime: number;
};

export type GenerationResult = {
	avgTime: number;
	carsTotal: number; // unreliable
	simulatedTime: number;
	avgSpeed: number;
	occupationRate: number;
  	lights: LightPhasing[];
	iterateNext: boolean;
};

export type GenerationResults = GenerationResult[];

export type GenerationInstruction = LightPhasing[];
