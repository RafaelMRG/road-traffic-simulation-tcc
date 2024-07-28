let simulationConfig;


window.addEventListener(UPDATE_EVENT_STR, () => updateAutomatedSimulation());

const getSimulatedTime = () => this.simulationConfig ? this.simulationConfig.simulatedTime : Number.POSITIVE_INFINITY;
const getIterations = () => this.simulationConfig ? this.simulationConfig.iterations : Number.POSITIVE_INFINITY;
let currentIteration = 0;

function startAutomatedSimulation(data /* :SimConfiguration */) {
	myRestartFunction();
	console.log(data)
  this.simulationConfig = data;
  TLJunctions.setPatternFromData(data.lightsConfig);
  startSim();
}

function updateAutomatedSimulation() {
  if (time < getSimulatedTime()) return;
  
  myRestartFunction();
  console.log(this.simulationConfig);
  sendDataToAngular(
		{
			avgTime: getAvgCarTimes(),
			carsTotal: Object.keys(vehTimings).length,
			simulatedTime: time,
			get avgSpeed() {
				return ((122.5 * 3) / this.avgTime) * 3.6;
			},
			iterateNext: currentIteration + 1 < this.simulationConfig.iterations,
		},
		"function",
		"nextIteration"
  );
  // Send data to angular
  
}

function nextIteration(data) {
  if (isStopped === false) return;
	this.simulationConfig = data;
  currentIteration++;
  TLJunctions.setPatternFromData(this.simulationConfig.lightsConfig);
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