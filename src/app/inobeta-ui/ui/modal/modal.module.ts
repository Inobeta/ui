import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IbModalMessageComponent } from './modal-message.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { IbModalMessageService } from './modal-message.service';


const entryComponents = [
  IbModalMessageComponent
];
const components = [
  IbModalMessageComponent

];

const services = [
  IbModalMessageService
];


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
    ...components
  ],
  declarations: [
    ...components
  ],
  providers: [
    ...services
  ],
  entryComponents: [
    ...entryComponents
  ]
})
export class IbModalModule { }
