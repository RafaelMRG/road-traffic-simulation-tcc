import { inject, Injectable } from "@angular/core";
import { SimCommsService } from "src/app/features/pages/simulation.page/simulation/services/sim-comms.service";
import { SimConfigControlService } from "src/app/features/pages/simulation.page/simulation/services/sim-config-control.service";
import { SnackbarService } from "src/app/features/services/snackbar.service";

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
		occupationRate: number;
	}) {
		console.table(data);
		// Send data to backend, check if iteration should end prematurely
		const post = () => {
			this.simCommsSvc.postMessage({
				type: "function",
				data: this.simConfSvc.simConfig,
				functionName: "nextIteration",
			});
			this.simConfSvc.currentIteration++;
		};
		const endSimulationFrameSide = () => {
			this.simCommsSvc.postMessage({
				type: "function",
				data: undefined,
				functionName: "endGeneration"
			})
		}
		
		if (data.iterateNext === false) {
			this.snackbar.showNotification(
				"Simulação terminou, processando dados ...",
				"success"
			);
			this.simulationIsDone = true;
			this.simConfSvc.isAutomatedSimulation = false;
			this.simConfSvc.currentIteration = 0;
			endSimulationFrameSide();
			return;
		}
		this.snackbar.showNotification(
			"Iniciando próxima iteração em 5 segundos",
			"info"
		);
		setTimeout(post, 5000);
	}

	startSimulation() {
		console.log(this.simConfSvc.simConfig);
		this.simConfSvc.currentIteration = 1;
		this.simConfSvc.isAutomatedSimulation = true;
		this.simCommsSvc.restartSim();
		this.postAutomatedSimulation();
		this.simCommsSvc.startSim();
	}
}

