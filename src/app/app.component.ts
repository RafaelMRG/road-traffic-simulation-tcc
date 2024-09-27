import { Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { MatGridListModule } from "@angular/material/grid-list";
import { NavbarComponent } from "src/app/features/navbar/navbar.component";
import { CommonModule } from "@angular/common";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatDivider } from "@angular/material/divider";
import { MatButtonModule } from "@angular/material/button";

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		RouterOutlet,
		MatIcon,
		MatGridListModule,
		NavbarComponent,
		CommonModule,
		MatSidenavModule,
		MatDivider,
		MatButtonModule,
		RouterModule
	],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent {
	constructor(private iconReg: MatIconRegistry) {
		this.iconReg.setDefaultFontSetClass('material-symbols-rounded');
	}

	title = 'Simulação de tráfego - TCC';

	navButtons: Navigation[] = [
		{
			icon: 'account_tree',
			title: 'Simulação',
			url: 'simulacao',
		},
		{
			icon: 'experiment',
			title: 'resultados',
			url: 'resultados',
		},
		{
			icon: 'help',
			title: 'Créditos',
			url: 'creditos',
		},
	];
}

type Navigation = {
	icon: string;
	title: string;
	url: string;
};
