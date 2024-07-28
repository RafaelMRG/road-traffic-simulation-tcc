import {
	AfterViewInit,
	Component,
	ElementRef,
	inject,
	OnDestroy,
	OnInit,
	ViewChild,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SnackbarService } from "src/app/features/services/snackbar.service";
import { MatCardModule } from "@angular/material/card";
import { MatSliderModule } from "@angular/material/slider";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { JsonPipe } from "@angular/common";
import { Subscription } from "rxjs";
import { MatDividerModule } from "@angular/material/divider";
import { SimService } from "src/app/features/simulation/services/sim.service";
import { SimConfigControlService } from "src/app/features/simulation/services/sim-config-control.service";
import { SimCommsService } from "src/app/features/simulation/services/sim-comms.service";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { OptimizationDialogComponent } from "src/app/features/simulation/components/optimization-dialog/optimization-dialog.component";

@Component({
	selector: "app-multiple-simulations.page",
	standalone: true,
	imports: [
		MatButtonModule,
		MatIconModule,
		MatCardModule,
		MatSliderModule,
		ReactiveFormsModule,
		JsonPipe,
		MatDividerModule,
		MatDialogModule,
	],
	templateUrl: "./multiple-simulations.page.component.html",
	styleUrl: "./multiple-simulations.page.component.scss",
})
export class MultipleSimulationsPageComponent
	implements OnInit, OnDestroy, AfterViewInit
{
	constructor() {
		this.carFollowingChanges =
			this.simConfigService.carFollowingControl.valueChanges.subscribe(() =>
				this.simConfigService.updateSliders()
			);

		this.trafficControlChanges =
			this.simConfigService.trafficControl.valueChanges.subscribe(() =>
				this.simConfigService.updateSliders()
			);
	}

	protected simService: SimService = inject(SimService);
	protected simConfigService = inject(SimConfigControlService);
	protected simCommsService = inject(SimCommsService);
	protected dialog = inject(MatDialog);

	protected readonly units = {
		veiPerHour: "vei/h",
		speed: "km/h",
		accel: "m/s²",
		percentage: "%",
		time: "s",
	};

	@ViewChild("legacyFrame", { static: false }) iframe!: ElementRef;

	trafficControlChanges!: Subscription;
	carFollowingChanges!: Subscription;

	ngOnDestroy(): void {
		this.trafficControlChanges.unsubscribe();
		this.carFollowingChanges.unsubscribe();
	}

	ngOnInit(): void {
		// Adiciona listener de mensagem do iframe
		window.addEventListener("message", this.receiveMessage.bind(this), false);
	}

	ngAfterViewInit(): void {
		this.simCommsService.frameWindow = this.frameWindow;
	}

	get frameWindow() {
		return this.iframe.nativeElement.contentWindow;
	}

	protected get isAutoControl() {
		return this.simConfigService.isAutomatedSimulation;
	}

	initRunConfig() {
		this.simConfigService.updateSliders();
		this.simService.handleSimulationStart();
	}

	states = {
		isStopped: false,
	};

	receiveMessage(event: MessageEvent): void {
		if (event.origin !== window.location.origin) {
			return;
		}

		const message = event.data;

		if (!message || !message.type) {
			return;
		}

		// Process the message received from the iframe
		if (message.type === "object") {
			// Handle the message data
		}

		if (message.type === "function") {
			if (message.functionName === "nextIteration") {
				this.simService.nextIteration(message.data);
			}
		}

		this.updateIsStoppedState(message);
	}

	updateIsStoppedState(message: { type: string; data: any }) {
		if (!this.states) return;
		if (message.type === "state") {
			this.states = {
				...this.states,
				...message.data,
			};
		}
	}

	openOptimizationDialog() {
		this.dialog.open(OptimizationDialogComponent, {
			width: "80vw",
			height: "80vh",
		});
	}
}
