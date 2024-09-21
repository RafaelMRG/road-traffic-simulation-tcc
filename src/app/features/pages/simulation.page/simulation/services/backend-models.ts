export type Simulation = {
	simulationId: number;
	selecteds: number;
	mutationRate: number;
	mutationMethod: string;
	population: number;
	avgTimeDelta: number;
	maxGenerations: number;
	minGenerations: number;
	createdAt: string;
	generations: Generation[];
}

export type Generation = {
	generationId: number;
	createdAt: string;
	citizens: Citizen[];
}

export type Citizen = {
	citizenId: number;
	duration: number;
	tripAvg: number;
	occupationRate: number;
	vehiclesTotal: number;
	averageSpeed: number;
	createdAt: string;
	roadCrossings: RoadCrossing[];
}

export type RoadCrossing = {
	redDuration: number;
	greenDuration: number;
	cycleStartTime: number;
	createdAt: string;
	roadCrossingId: number;
}