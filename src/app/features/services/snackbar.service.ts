import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root',
})
export class SnackbarService {
	constructor(private snackBar: MatSnackBar) {}

  showNotification(message: string, type?: NotificationType) {
    let panelClass = '';

    switch (type) {
      case 'warn':
        panelClass = 'warn-notification';
        break;
      case 'error':
        panelClass = 'error-notification';
        break;
      case 'info':
        panelClass = 'info-notification';
        break;
      case 'success':
        panelClass = 'success-notification';
        break;
      default:
        panelClass = 'general-notification';
    }

    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: [panelClass],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}

export type NotificationType = 'warn' | 'error' | 'info' | 'success' | 'general';
