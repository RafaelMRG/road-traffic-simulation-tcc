window.addEventListener(
	"message",
	function (event) {
		if (event.origin !== window.location.origin) {
			return;
		}

		const message = event.data;
		if (!message || !message.type) return;

		// Process the message received from the parent Angular application
		if (message.type === "function") {
			isStartStop(message.data);
			isRestart(message.data);
			isSetSliders(message);
			isStartOrStop(message.data);
			isStartAutomatedSimulation(message);
			isStartNextIteration(message);
		}

		if (message.type === "object" && typeof message.data === "object") {
		}

		// Example of sending a message back to the parent Angular application
	},
	false
);

function sendDataToAngular(data, type, functionName) {
	if (functionName) {
		window.parent.postMessage({ type, data, functionName }, "*");
	} else {
		window.parent.postMessage({ type, data }, "*");
	}
}

const isStartStop = function (data) {
	if (data === "startStop") {
		myStartStopFunction();
		_updateIsStoppedState();
	}
};

const isRestart = function (data) {
	if (data === "restart") {
		myRestartFunction();
		_updateIsStoppedState();
	}
};

const isSetSliders = function (message) {
	if (message.data != undefined && message.functionName === 'setSliders') {
		this[message.functionName](...message.data);
	}
}

const isStartOrStop = function (data) {
	if (data === 'stop') {
		stopSim();
	} else if (data === 'start') {
		startSim();
	}
}

const isStartAutomatedSimulation = function (message) {
	if (message.functionName === 'automatedSimulation') {
		startAutomatedSimulation(message.data);
	}
}

const isStartNextIteration = function (message) {
	if (message.functionName === 'nextIteration') {
		nextIteration(message.data);
	}
}

const _updateIsStoppedState = function () {
	sendDataToAngular({ isStopped }, "state");
};

const getAvgCarTimes = function () {
	const deltas = Object.values(vehTimings)
		.filter(nans)
		.map((timing) => timing.delta);

	const sum = deltas.reduce((a, b) => a + b, 0);
	const avg = sum / deltas.length || 0;
	console.log('Tempo médio das rotas: ' + avg)
	return avg;
};

const nans = function (vehTiming) {
	return !isNaN(vehTiming.delta);
};
