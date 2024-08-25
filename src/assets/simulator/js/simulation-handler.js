var simulationConfig;


window.addEventListener(UPDATE_EVENT_STR, () => updateAutomatedSimulation());

const getSimulatedTime = () => simulationConfig ? simulationConfig.simulatedTime : Number.POSITIVE_INFINITY;
const getIterations = () => simulationConfig ? simulationConfig.population : Number.POSITIVE_INFINITY;
let currentIteration = 0;

function startAutomatedSimulation(data /* :SimConfiguration */) {
	myRestartFunction();
	console.log(data)
  simulationConfig = data;
  TLJunctions.setPatternFromData(data.lightsConfig);
  startSim();
}

function updateAutomatedSimulation() {
	console.log(simulationConfig)
  if (time < getSimulatedTime()) return;
	const simulatedTime = time;
  myRestartFunction();
  console.log(simulationConfig);
  sendDataToAngular(
		{
			avgTime: getAvgCarTimes(),
			carsTotal: getTotalVehicles(),
			simulatedTime,
			get avgSpeed() {
				return ((122.5 * 3) / this.avgTime) * 3.6;
			},
			get occupationRate() {
				return (this.carsTotal * 0.5 / this.simulatedTime * 60 * 60 ) / 4200 // taxa de fluxo de parte simétrica / fluxo de saturação teórico
			},
			iterateNext: currentIteration + 1 < simulationConfig.population,
		},
		"function",
		"nextIteration"
	);
	resetTimings();
  // Send data to angular
}

function nextIteration(data) {
  if (isStopped === false) return;
	simulationConfig = data;
  currentIteration++;
  TLJunctions.setPatternFromData(simulationConfig.lightsConfig);
  startSim();
}



/* 
type SimConfiguration = {
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

type LightPhasing = {
	redDuration: number;
	greenDuration: number;
  cycleStartTime: number;
};


*/