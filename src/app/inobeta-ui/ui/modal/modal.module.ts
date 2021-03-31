import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IbModalMessageComponent } from './modal-message.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';


const entryComponents = [
  IbModalMessageComponent
];
const components = [
  IbModalMessageComponent

];

const services = [
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
