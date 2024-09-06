import { inject, Injectable } from "@angular/core";
import { ApiRequests } from "./api.interface";
import { GenerationInstruction, GenerationResults, SimConfiguration } from "../models";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiRequestsService implements ApiRequests {

  private http = inject(HttpClient);

  private PORT = '8000'
  private BASE_URL = `http://localhost:${this.PORT}`;


  createSimulation(simulationParams: Partial<SimConfiguration>): Promise<{ id: number }> {
    return firstValueFrom(
       this.http.post<{ id: number }>(this.BASE_URL + '/simulation/create', simulationParams)
    )
  }

  endSimulation(id: number): Promise<void> {
    return firstValueFrom(
       this.http.post<void>(this.BASE_URL + '/simulation/premature-termination/' + id, null)
    )
  }

  getAllSimulations(): Promise<Record<string, number | string>[]> {
    return firstValueFrom(
       this.http.get<Record<string, number | string>[]>(this.BASE_URL + '/simulation/all')
    )
  }

  getFinalResults(id: number): Promise<Record<string, number | string>> {
    return firstValueFrom(
       this.http.get<Record<string, number | string>>(this.BASE_URL + '/simulation/final-results/' + id)
    )
  }

  isSimulationDone(id: number): Promise<[boolean]> {
    return firstValueFrom(
       this.http.get<[boolean]>(this.BASE_URL + `/simulation/done/${id}`)
    )
  }

  processGenerationResults(id: number, results: GenerationResults): Promise<GenerationInstruction[]> {
    return firstValueFrom(
       this.http.post<GenerationInstruction[]>(this.BASE_URL + `/simulation/process-results/${id}`, results)
    )
  }
}
