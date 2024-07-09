window.addEventListener(
	"message",
	function (event) {
		if (event.origin !== window.location.origin) {
			return;
		}

		const message = event.data;
		if (!message || !message.type) return;
		console.log("Message received from parent:", message);

		// Process the message received from the parent Angular application
		if (message.type === "function") {
			console.log("message of type function getting called from angular");
			isStartStop(message.data);
			isRestart(message.data);
		}

		if (message.type === "object" && typeof message.data === "object") {
			console.log("message of type object getting called from angular");
		}

		// Example of sending a message back to the parent Angular application
	},
	false
);

function sendDataToAngular(data, type) {
	if (typeof type !== "string") throw new Error("Type of data is not string");
	window.parent.postMessage({ type: type, data: data }, "*");
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

const _updateIsStoppedState = function () {
	printAvgCarTimes();
	vehTimings = {};
	sendDataToAngular({ isStopped: isStopped }, "state");
};

const printAvgCarTimes = function () {
	const deltas = Object.values(vehTimings)
		.filter(nans)
		.map((timing) => timing.delta);

	const sum = deltas.reduce((a, b) => a + b, 0);
	const avg = sum / deltas.length || 0;
	console.log(avg);
};

const nans = function (vehTiming) {
	return !isNaN(vehTiming.delta);
};
