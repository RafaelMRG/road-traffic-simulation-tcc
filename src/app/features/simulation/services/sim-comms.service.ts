import { Injectable } from '@angular/core';
import { MultipleSimulationsPageComponent } from 'src/app/features/pages/multiple-simulations.page/multiple-simulations.page.component';

@Injectable({
	providedIn: "root",
})
export class SimCommsService {
	constructor() {}

	startStopSim() {
		this.postMessage({ type: "function", data: "startStop" });
	}

	startSim() {
		this.postMessage({ type: "function", data: "start" });
	}

	stopSim() {
		this.postMessage({ type: "function", data: "stop" });
	}

	restartSim() {
		this.postMessage({ type: "function", data: "restart" });
	}

	frameWindow?: Window;

	
  
	postMessage(msg: Message) {
		this.checkFrameNPE();
		this.frameWindow?.postMessage(msg, "*");
	}

	private checkFrameNPE() {
		if (this.frameWindow === undefined)
			throw new Error(
				"Erro de desenvolvimento: Necessário garantir que o frameWindow está injetado corretamente"
			);
	}
}

type Message = {
  type: string;
  data: unknown;
  functionName?: string;
}