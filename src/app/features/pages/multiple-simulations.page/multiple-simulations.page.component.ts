import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationType, SnackbarService } from 'src/app/features/services/snackbar.service';

@Component({
	selector: 'app-multiple-simulations.page',
	standalone: true,
	imports: [MatButtonModule, MatIconModule],
	templateUrl: './multiple-simulations.page.component.html',
	styleUrl: './multiple-simulations.page.component.scss',
})
export class MultipleSimulationsPageComponent implements OnInit {
	@ViewChild('legacyFrame', { static: false }) iframe!: ElementRef;

	private snackbar: SnackbarService = inject(SnackbarService);

	ngOnInit(): void {
		window.addEventListener('message', this.receiveMessage.bind(this), false);
	}

	startStopSim() {
		this.postMessage({ type: 'function', data: 'startStop' });
	}

	restartSim() {
		this.postMessage({ type: 'function', data: 'restart' });
	}

	private postMessage({ type, data }: { type: string; data: string }) {
		this.frameWindow.postMessage({ type, data }, '*');
	}

	get frameWindow() {
		return this.iframe.nativeElement.contentWindow;
	}

	receiveMessage(event: MessageEvent): void {
		if (event.origin !== window.location.origin) {
			return;
		}

		const message = event.data;

		if (!message || !message.type) {
			return;
		}

		console.log('Message received from iframe:', message);

		// Process the message received from the iframe
		if (message.type === 'object') {
			// Handle the message data
			console.log('Data from iframe:', message.data);
		}

		this.updateIsStoppedState(message);
	}

	states = {
		isStopped: false,
	};

	updateIsStoppedState(message: { type: string; data: any }) {
		if (message.type === 'state') {
			this.states = {
				...this.states,
				...message.data,
			};
		}
	}
}
