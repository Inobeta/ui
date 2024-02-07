import { Injectable } from "@angular/core";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";

/**
 * Displays toast notifications
 *
 * Usage:
 * - Inject the `IbToastNotification` service in your component or service.
 * - Call the `open` method to display a toast notification.
 *
 * Example:  
 * ```typescript
 * constructor(private toastService: IbToastNotification) {}
 *
 * showMessage() {
 *   this.toastService.open('user.created.feedback', 'success');
 * }
 * ```
 */
@Injectable({ providedIn: "root" })
export class IbToastNotification {
  constructor(
    private translate: TranslateService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Method to open a toast notification.
   *
   * @param message The message to display in the toast notification
   * @param type The type of notification (e.g., 'success', 'error', 'warning')
   * @param duration Duration in milliseconds for how long the notification should be visible
   * @param horizontalPosition Horizontal position of the notification ('start', 'center', 'end', 'left', 'right')
   * @param verticalPosition Vertical position of the notification ('top', 'bottom')
   */
  open(
    message: string,
    type: string = "success",
    duration: number = 5000,
    horizontalPosition: MatSnackBarHorizontalPosition = "end",
    verticalPosition: MatSnackBarVerticalPosition = "top"
  ): void {
    this.translate.get(message).subscribe((translatedMessage) => {
      this.snackBar.open(translatedMessage, null, {
        duration: duration,
        horizontalPosition: horizontalPosition,
        verticalPosition: verticalPosition,
        panelClass: `ib-toast-${type}`,
      });
    });
  }
}