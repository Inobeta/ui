import { NgModule } from '@angular/core';
import { SpinnerLoadingStubComponent } from './http/spinner-loading.stub.spec';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IbLoginServiceStub } from './auth/login.service.stub.spec';
import { IbLoginService } from './auth/login.service';
import { IbLoadingStubDirective } from './http/loading-skeleton.directive.stub.spec';


@NgModule({
  imports: [
    HttpClientTestingModule
  ],
  exports: [
    SpinnerLoadingStubComponent,
    IbLoadingStubDirective
  ],
  declarations: [
    SpinnerLoadingStubComponent,
    IbLoadingStubDirective
  ],
  providers: [
    { provide: IbLoginService, useClass: IbLoginServiceStub},
  ]
})
export class IbHttpTestModule { }
