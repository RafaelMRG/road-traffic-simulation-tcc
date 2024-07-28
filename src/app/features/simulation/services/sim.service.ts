import { inject, Injectable } from "@angular/core";
import { SnackbarService } from "src/app/features/services/snackbar.service";
import { SimCommsService } from "src/app/features/simulation/services/sim-comms.service";
import { SimConfigControlService } from "src/app/features/simulation/services/sim-config-control.service";

@Injectable({
	providedIn: "root",
})
export class SimService {
	constructor() {}

	private simCommsSvc = inject(SimCommsService);
	private simConfSvc = inject(SimConfigControlService);
	private snackbar = inject(SnackbarService);

	simulationIsDone = false;

	handleSimulationStart() {
		setTimeout(() => this.simCommsSvc.restartSim(), 100);

		if (!this.simConfSvc.isAutomatedSimulation) return;
		this.postAutomatedSimulation();
	}
	
	private postAutomatedSimulation() {
		this.simCommsSvc.postMessage({
			type: "function",
			data: this.simConfSvc.simConfig,
			functionName: "automatedSimulation",
		});
	}
	
	nextIteration(data: {
		avgTime: number;
		carsTotal: number;
		avgSpeed: number;
		iterateNext: boolean;
	}) {
		// Send data to backend, check if iteration should end prematurely
		const post = () => {
			this.simCommsSvc.postMessage({
				type: "function",
				data: this.simConfSvc.simConfig,
				functionName: "nextIteration",
			});
			this.simConfSvc.currentIteration++;
		};
		if (data.iterateNext === false) {
			this.snackbar.showNotification(
				"Simulação terminou, processando dados ...",
				"success"
			);
			this.simulationIsDone = true;
			this.simConfSvc.isAutomatedSimulation = false;
			this.simConfSvc.currentIteration = 0;
			return;
		}
		this.snackbar.showNotification(
			"Iniciando próxima iteração em 5 segundos",
			"info"
		);
		setTimeout(post, 5000);
	}

	startSimulation() {
		this.simConfSvc.currentIteration = 1;
		this.simConfSvc.isAutomatedSimulation = true;
		this.simCommsSvc.restartSim();
		this.postAutomatedSimulation();
		this.simCommsSvc.startSim();
	}
}

