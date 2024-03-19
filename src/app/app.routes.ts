import { Routes } from '@angular/router';
import { CreditsPageComponent } from 'src/app/features/pages/credits.page/credits.page.component';
import { MultipleSimulationsPageComponent } from 'src/app/features/pages/multiple-simulations.page/multiple-simulations.page.component';
import { ValidationPageComponent } from 'src/app/features/pages/validation.page/validation.page.component';

export const routes: Routes = [
    {path: 'home', redirectTo: ''},
    {path: 'multiplos', component: MultipleSimulationsPageComponent},
    {path: 'validacao-e-testes', component: ValidationPageComponent},
    {path: 'creditos', component: CreditsPageComponent},
];
