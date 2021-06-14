import { NgModule } from '@angular/core';
import { IbHttpClientService } from './http/http-client.service';
import { IbResponseHandlerService } from './http/response-handler.service';
import { IbAuthService } from './auth/auth.service';
import { IbSessionService } from './auth/session.service';
import { SpinnerLoadingStubComponent } from './http/spinner-loading.stub.spec';
import { authServiceStub } from './auth/auth.service.stub.spec';
import { localStorageStub } from './auth/local-storage.stub.spec';
import { cookiesStorageStub } from './auth/cookies-storage.stub.spec';
import { sessionServiceStub } from './auth/session.stub.spec';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { responseHandlerStub } from './http/response-handler.service.stub.spec';



const components = [
  SpinnerLoadingStubComponent
];

const services = [
  IbHttpClientService,
  IbResponseHandlerService,
  { provide: IbAuthService, useValue: authServiceStub},
  { provide: IbSessionService, useValue: sessionServiceStub},
  { provide: IbResponseHandlerService, useValue: responseHandlerStub}
];


@NgModule({
  imports: [
    HttpClientTestingModule
  ],
  exports: [
    ...components
  ],
  declarations: [
    ...components
  ],
  providers: [
    ...services
  ]
})
export class IbHttpTestModule { }
