import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbModalMessageService } from './modal-message.service';
import { IbModalMessageServiceStub } from './modal-message.service.stub.spec';


const entryComponents = [
];
const components = [
];


@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    ...components
  ],
  declarations: [
    ...components
  ],
  providers: [
    { provide: IbModalMessageService, useClass: IbModalMessageServiceStub}
  ],
  entryComponents: [
    ...entryComponents
  ]
})
export class IbModalTestModule { }
