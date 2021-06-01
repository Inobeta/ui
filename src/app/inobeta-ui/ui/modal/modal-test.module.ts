import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbModalMessageService } from './modal-message.service';
import { IbModalMessageServiceStub } from './modal-message.service.stub.spec';



@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
  ],
  declarations: [
  ],
  providers: [
    { provide: IbModalMessageService, useClass: IbModalMessageServiceStub}
  ]
})
export class IbModalTestModule { }
