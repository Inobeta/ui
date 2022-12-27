import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarHorizontalPosition as MatSnackBarHorizontalPosition, MatLegacySnackBarVerticalPosition as MatSnackBarVerticalPosition } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({providedIn: 'root'})
export class IbToastNotification {
  constructor(
    private translate: TranslateService,
    private snackBar: MatSnackBar
    ) { }

  open(
    message,
    type = 'success',
    duration = 5000,
    horizontalPosition:MatSnackBarHorizontalPosition = 'end',
    verticalPosition: MatSnackBarVerticalPosition = 'top'
    ){
    this.translate.get(message).subscribe(t => {
      this.snackBar.open(t, null, {
        duration: duration,
        horizontalPosition: horizontalPosition,
        verticalPosition: verticalPosition,
        panelClass: `ib-toast-${type}`
      });
    })
  }

}
