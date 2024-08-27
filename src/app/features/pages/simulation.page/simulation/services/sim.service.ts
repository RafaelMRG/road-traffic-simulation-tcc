import { inject, Injectable } from "@angular/core";
import { GenerationResult } from "src/app/features/pages/simulation.page/simulation/services/models";
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

	/** Stops the simulation from running when opening the page */
	handleSimIframeInitialState() {
		setTimeout(() => this.simCommsSvc.restartSim(), 100);

		if (!this.simConfSvc.isAutomatedSimulation) return;
	}

	private postAutomatedSimulation() {
		this.simCommsSvc.postMessage({
			type: "function",
			data: this.simConfSvc.simConfig,
			functionName: "automatedSimulation",
		});
	}

	nextIteration(data: GenerationResult) {
		console.table(data);
		const post = () => {
			this.simCommsSvc.postMessage({
				type: "function",
				data: this.simConfSvc.simConfig,
				functionName: "nextIteration",
			});
			this.simConfSvc.currentPopulation++;
		};
		this.simConfSvc.addResult(data);
		if (data.iterateNext === false) {
			this.snackbar.showNotification(
				"Geração terminou, processando dados para gerar próxima geração",
				"success"
			);
			// asks backend for next generation
			this.simulationIsDone = true;
			this.simConfSvc.currentPopulation = 1;
			this.endSimulationFrameSide();
			return;
		}
		this.snackbar.showNotification(
			"Iniciando próxima iteração em 5 segundos",
			"info"
		);
		setTimeout(post, 5000);
	}

	startSimulation() {
		// ask backend to create simulation
		console.log(this.simConfSvc.simConfig);
		this.simConfSvc.currentPopulation = 1;
		this.simConfSvc.currentGeneration = 1;
		this.simConfSvc.isAutomatedSimulation = true;
		this.simCommsSvc.restartSim();
		this.postAutomatedSimulation();
	}

	endSimulationFrameSide() {
		this.simCommsSvc.postMessage({
			type: "function",
			data: undefined,
			functionName: "endGeneration",
		});
	};
	
	stopAutomatedSimulation(){
		this.endSimulationFrameSide();
		this.simCommsSvc.stopSim();
		this.simConfSvc.resetConfig();
		this.snackbar.showNotification('Simulação prematuramente terminada', 'info');
	}
}

