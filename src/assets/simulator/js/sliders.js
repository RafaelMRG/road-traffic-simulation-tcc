function setSliders(
	{ mainInflow, secondaryInflow, percentRight, percentLeft, timelapse },
	{ maxSpeed, timeGap, maxAccel }
) {
	setTimewarpSlider(timelapse);
	setMainInflowSlider(mainInflow);
	setSecondaryInflowSlider(secondaryInflow);
	setFracRight(percentRight);
	setFracLeft(percentLeft);
	setMaxSpeed(maxSpeed);
	setTimeGap(timeGap);
	setMaxAccel(maxAccel);
	logColor("Valores dos sliders setados internamente");
	console.log(
		timelapse,
		mainInflow,
		secondaryInflow,
		percentRight,
		percentLeft,
		maxSpeed,
		timeGap,
		maxAccel
	);
}

function setTimewarpSlider(value) {
	timewarp = value;
	dt = timewarp / fps;
}

function setMainInflowSlider(value) {
	qIn = value / 3600;
}

function setSecondaryInflowSlider(value) {
	q2 = value / 3600;
}

function setFracRight(value) {
	fracRight = value / 100;
}

function setFracLeft(value) {
	fracLeft = value / 100;
}

function setMaxSpeed(value) {
	const shouldUpdate = updateModelsOnValueChanges(IDM_v0, value / 3.6);
	IDM_v0 = value / 3.6;
	if (shouldUpdate) updateModels();
}

function setTimeGap(value) {
	const shouldUpdate = updateModelsOnValueChanges(IDM_T, value);
	IDM_T = value;
	if (shouldUpdate) updateModels();
}

function setMaxAccel(value) {
	const shouldUpdate = updateModelsOnValueChanges(IDM_a, value);
	IDM_a = value;
	if (shouldUpdate) updateModels();
}

function updateModelsOnValueChanges(variable, value){
	if (variable !== value) {
		return true;
	}
	return false;
}