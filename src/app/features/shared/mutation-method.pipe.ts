import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'mutationMethod',
  standalone: true
})
export class MutationMethodPipe implements PipeTransform {

  transform(value: string): string {
    if (value === 'rim') {
      return 'Mutação individual aleatória'
    } else if (value === 'pbm') {
      return 'Mutação baseada em probabilidade'
    }
    return '-';
  }

}
