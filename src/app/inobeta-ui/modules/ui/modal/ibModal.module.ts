import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ModalMessageComponent } from './modalMessage.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material';


const entryComponents = [
  ModalMessageComponent
]
const components = [
  ModalMessageComponent

]

const services = [
]


@NgModule({
  imports: [
    TranslateModule.forChild({
      extend: true
    }),
    CommonModule,
    MatDialogModule
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
