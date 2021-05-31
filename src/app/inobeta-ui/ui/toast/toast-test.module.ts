import { NgModule } from '@angular/core';
import { IbToastNotification } from './toast.service';
import { toastServiceStub } from './toast.service.stub.spec';


@NgModule({
  imports: [
  ],
  exports: [],
  declarations: [
  ],
  providers: [
    { provide: IbToastNotification, useValue: toastServiceStub}
  ],
})
export class IbToastTestModule { }
