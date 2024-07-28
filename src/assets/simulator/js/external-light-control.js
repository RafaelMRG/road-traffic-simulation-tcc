const UPDATE_EVENT_STR = "updateTLStates";
const UPDATE_EVENT = new Event(UPDATE_EVENT_STR);

class LightJunctions {
  intersections = [];

  constructor(TLArray) {
    this.#buildJunctions(TLArray);
  }

  #buildJunctions(TLArray) {
    if (TLArray.length % 4 !== 0) {
      throw new Error("TLArray não possui tamanho par correto");
    }

    const step = 4;

    for (let i = 0; i < TLArray.length; i += step) {
      this.intersections.push(new LightJunction(TLArray.slice(i, i + step)));
    }
  }

  dropInRoads(intersects = [[]]) {
    this.intersections.forEach((val, i) => {
      const intersection = intersects[i];
      intersection.forEach((int, j) => {
        const sourceToUse = j > 1 ? u20Source - laneWidth : u05Source;
        const tl = val.lightObjects[j];
        trafficObjs.dropObject(
          tl,
          network,
          network[int].traj[0](sourceToUse),
          network[int].traj[1](sourceToUse),
          20
        );
      });
    });
	}
	
	setHalfWavePattern() {
		const cycleOffset = this.intersections[0].cycleDuration / 2
		this.intersections[1].cycleStartTime = cycleOffset;
		this.intersections[2].cycleStartTime = cycleOffset * 2;
  }
  
  setPatternFromData(data) {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      this.intersections[i].cycleStartTime = element.cycleStartTime;
      this.intersections[i].redDuration = element.redDuration;
      this.intersections[i].greenDuration = element.greenDuration;
    }
  }
}

class LightJunction {
  constructor(TRArraySlice) {
    const step = 2;
    for (let i = 0; i < TRArraySlice.length; i += step) {
      const TLH = TRArraySlice[i];
      const TLV = TRArraySlice[i + step - 1];
      this.hoz.push(TLH);
      this.vert.push(TLV);
    }
    this.primePhases();
  }

  #allowedMod = 0 + 2 * dt;
  hoz = [];
  vert = [];
  greenDuration = 20;
  redDuration = 30;
  cycleStartTime = 0;

  get lightObjects() {
    return [...this.hoz, ...this.vert];
  }

  get cycleDuration() {
    return this.greenDuration + this.redDuration;
  }

  get updateListener() {
    return () => {
			const mod = (time - this.cycleStartTime) % this.cycleDuration;
			if (time < this.cycleStartTime) {
				this.setRedPhase();
			}
      if (mod < 1 && mod > 0) {
        this.setGreenPhase();
      } else if (
        mod > this.greenDuration &&
        mod < this.greenDuration + 1
      ) {
        this.setRedPhase();
      }
    };
  }

  setGreenPhase() {
    this.hoz.forEach((val) => trafficObjs.setTrafficLight(val, "green"));
    this.vert.forEach((val) => trafficObjs.setTrafficLight(val, "red"));
  }

  setRedPhase() {
    this.hoz.forEach((val) => trafficObjs.setTrafficLight(val, "red"));
    this.vert.forEach((val) => trafficObjs.setTrafficLight(val, "green"));
  }

  setDurations(greenDuration, redDuration) {
    this.setGreenDuration(greenDuration);
    this.setRedDuration(redDuration);
  }

  setGreenDuration(duration) {
    this.greenDuration = duration;
  }

  setRedDuration(duration) {
    this.redDuration = duration;
  }
	
	primePhases() {
		this.setGreenPhase();
		this.addLightControlListener();
	}

  addLightControlListener() {
    window.addEventListener(UPDATE_EVENT_STR, this.updateListener);
  }

}
