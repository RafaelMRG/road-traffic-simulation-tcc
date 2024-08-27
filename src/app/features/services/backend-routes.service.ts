import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendRoutesService {

  constructor() { }

  private readonly SIMULATION_ROUTES: Record<string, string> = {
    createSimulation: '',
    processResults: '',
    finalResult: '',
    pastSimulations: '',
    prematureEnding: '',
  }
}
