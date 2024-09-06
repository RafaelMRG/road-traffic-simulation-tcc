import {
	GenerationInstruction,
	GenerationResults, SimConfiguration
} from "src/app/features/pages/simulation.page/simulation/services/models";

export interface ApiRequests {
	createSimulation: (simulationParams: Partial<SimConfiguration>) => Promise<{ id: number }>;
	processGenerationResults: (id: number, results: GenerationResults) => Promise<GenerationInstruction[]>;
	isSimulationDone: (id: number) => Promise<[true | false]>;
	endSimulation: (id: number) => Promise<void>;

	// stats
	getFinalResults: (id: number) => Promise<Record<string, number | string>>;
	getAllSimulations: () => Promise<Record<string, number | string>[]>;
}
