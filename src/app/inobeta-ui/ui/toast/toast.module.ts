import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { IbToastNotification } from './toast.service';


@NgModule({
  imports: [
    MatSnackBarModule
  ],
  exports: [],
  declarations: [
  ],
  entryComponents: [
  ],
  providers: [IbToastNotification],
})
export class IbToastModule { }
