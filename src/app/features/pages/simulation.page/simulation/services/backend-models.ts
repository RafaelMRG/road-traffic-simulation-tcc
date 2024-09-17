export type Simulation = {
	selecteds: number;
	mutation_rate: number;
	population: number;
	avg_time_delta: number;
	max_generations: number;
	min_generations: number;
	generations: Generation[];
}

export type Generation = {
	simulation_id: number;
	citizens: Citizen[];
}

export type Citizen = {
	duration: number;
	trip_avg: number;
	occupation_rate: number;
	vehicles_total: number;
	average_speed: number;
	generation_id: number;
	road_crossings: RoadCrossing[];
}

export type RoadCrossing = {
	red_duration: number;
	green_duration: number;
	cycle_start_time: number;
	citizen_id: number;
}