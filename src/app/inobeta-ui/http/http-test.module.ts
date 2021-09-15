import { NgModule } from '@angular/core';
import { IbHttpClientService } from './http/http-client.service';
import { IbResponseHandlerService } from './http/response-handler.service';
import { IbAuthService } from './auth/auth.service';
import { IbSessionService } from './auth/session.service';
import { SpinnerLoadingStubComponent } from './http/spinner-loading.stub.spec';
import { authServiceStub } from './auth/auth.service.stub.spec';
import { localStorageStub } from './auth/local-storage.stub.spec';
import { sessionServiceStub } from './auth/session.stub.spec';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { responseHandlerStub } from './http/response-handler.service.stub.spec';



@NgModule({
  imports: [
    HttpClientTestingModule
  ],
  exports: [
    SpinnerLoadingStubComponent
  ],
  declarations: [
    SpinnerLoadingStubComponent
  ],
  providers: [
    IbHttpClientService,
    IbResponseHandlerService,
    { provide: IbAuthService, useValue: authServiceStub},
    { provide: IbSessionService, useValue: sessionServiceStub},
    { provide: IbResponseHandlerService, useValue: responseHandlerStub}
  ]
})
export class IbHttpTestModule { }
