import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private snackbar: MatSnackBar = inject(MatSnackBar);

  public error(message: string): void {
    this.snackbar.open(message, 'Close', { duration: 5000, panelClass: ['snack-error'] });
  }

  public success(message: string): void {
    this.snackbar.open(message, 'Close', { duration: 5000, panelClass: ['snack-success'] });
  }
}
