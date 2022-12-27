import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IbModalMessageComponent } from './modal-message.component';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { IbModalMessageService } from './modal-message.service';


@NgModule({
  imports: [
    TranslateModule.forChild({
      extend: true
    }),
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports: [
    IbModalMessageComponent
  ],
  declarations: [
    IbModalMessageComponent
  ],
  providers: [
    IbModalMessageService
  ]
})
export class IbModalModule { }
