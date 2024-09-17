import { inject, Injectable } from "@angular/core";
import { GenerationResult, LightPhasing } from "src/app/features/pages/simulation.page/simulation/services/models";
import { SimCommsService } from "src/app/features/pages/simulation.page/simulation/services/sim-comms.service";
import {
	SimConfigControlService
} from "src/app/features/pages/simulation.page/simulation/services/sim-config-control.service";
import { SnackbarService } from "src/app/features/services/snackbar.service";
import { ApiRequestsService } from "./api/api-requests.service";
import { LightSettingsService } from "../components/lights-settings-dialog/light-settings.service";

@Injectable({
	providedIn: "root"
})
export class SimService {
	constructor() {
	}

	private simCommsSvc = inject(SimCommsService);
	private simConfSvc = inject(SimConfigControlService);
	private snackbar = inject(SnackbarService);
	private api = inject(ApiRequestsService);
	private lightSvc = inject(LightSettingsService);

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
			functionName: "automatedSimulation"
		});
	}

	async nextIteration(data: GenerationResult) {
		console.table(data);
		const post = () => {
			const currPop = ++this.simConfSvc.currentPopulation;
			this.simConfSvc.simConfig.lightsConfig = this.simConfSvc.optimizationLightCfg[currPop - 1];
			this.simCommsSvc.postMessage({
				type: "function",
				data: this.simConfSvc.simConfig,
				functionName: "nextIteration"
			});
		};
		this.simConfSvc.addResult(data);
		if (this.simConfSvc.currentPopulation >= this.simConfSvc.simConfig.population) {
			this.snackbar.showNotification(
				"Geração terminou, processando dados para gerar próxima geração",
				"success"
			);
			if (this.simConfSvc.simulationId === undefined) throw new Error('ID de simulação é indefinido')
			await this.api.processGenerationResults(this.simConfSvc.simulationId, this.simConfSvc.results)
				.then((result) => this.simConfSvc.optimizationLightCfg = result);
			const backEndResult: LightPhasing[][] | null = this.simConfSvc.optimizationLightCfg;

			this.simConfSvc.currentPopulation = 1;
			if (backEndResult === null || backEndResult.length === 0) {
				this.simConfSvc.isAutomatedSimulation = false; // Desabilita modo de automação
				this.simulationIsDone = true;
				this.simConfSvc.currentGeneration = 1;
				this.endSimulationFrameSide();
			} else {
				this.simConfSvc.currentGeneration++;
				// Replace light configuration for generation
				this.snackbar.showNotification(
					"Iniciando próxima geração em 5 segundos",
					"info"
				);
				await this.startSimulation(true);
			}
			this.simConfSvc.resetResult();
			return;
		}
		this.snackbar.showNotification(
			"Iniciando próxima iteração em 5 segundos",
			"info"
		);
		setTimeout(post, 5000);
	}

	async startSimulation(skipGenerationReset?: boolean) {
		if (!skipGenerationReset){
			this.simConfSvc.simulationId =
				await this.api.createSimulation(this.simConfSvc.simConfig)
				.then(res => res.id);
			// ask backend to create simulation
			this.lightSvc.setOptimizationLights();
			this.simConfSvc.currentGeneration = 1;
		}
		this.simConfSvc.currentPopulation = 1;
		this.simConfSvc.simConfig.lightsConfig = this.simConfSvc.optimizationLightCfg[0];
		this.simConfSvc.isAutomatedSimulation = true;
		this.simCommsSvc.restartSim();
		this.postAutomatedSimulation();
	}

	endSimulationFrameSide() {
		this.simCommsSvc.postMessage({
			type: "function",
			data: undefined,
			functionName: "endGeneration"
		});
	};

	stopAutomatedSimulation() {
		this.endSimulationFrameSide();
		this.simCommsSvc.stopSim();
		this.simConfSvc.resetConfig();
		this.snackbar.showNotification("Simulação prematuramente terminada", "info");
	}
}

