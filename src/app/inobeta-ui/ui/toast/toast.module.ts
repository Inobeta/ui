import { NgModule } from '@angular/core';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { IbToastNotification } from './toast.service';


@NgModule({
  imports: [
    MatSnackBarModule
  ],
  exports: [],
  declarations: [
  ],
  providers: [IbToastNotification],
})
export class IbToastModule { }
