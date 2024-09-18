import { Pipe, PipeTransform } from "@angular/core";
import { Citizen } from "../../../../simulation.page/simulation/services/backend-models";

@Pipe({
  name: 'generationBestTime',
  standalone: true
})
export class GenerationBestTimePipe implements PipeTransform {

  transform(citizens: Citizen[]): number {
    let biggestAvgTime: number = Number.POSITIVE_INFINITY;
    citizens.forEach(citizen => {
      if (citizen.tripAvg < biggestAvgTime) {
        biggestAvgTime = citizen.tripAvg;
      }
    })
    return biggestAvgTime;
  }

}
