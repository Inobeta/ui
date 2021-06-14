import { NgModule } from '@angular/core';
import { IbStorageService } from './storage.service';
import { IbStorageServiceStub } from './storage.stub.spec';


@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [
    { provide: IbStorageService, useClass: IbStorageServiceStub}
  ],
})
export class IbStorageTestModule { }
