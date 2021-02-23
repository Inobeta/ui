import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IbHttpClientService } from './http/http-client.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IbResponseHandlerService } from './http/response-handler.service';
import { IbAuthService } from './auth/auth.service';
import { IbSessionService } from './auth/session.service';
import { LocalStorageService, CookiesStorageService } from 'ngx-store';
import { SpinnerLoadingStubComponent } from './http/spinner-loading.stub.spec';
import { authServiceStub } from './auth/auth.service.stub';
import { localStorageStub } from './auth/local-storage.stub';
import { cookiesStorageStub } from './auth/cookies-storage.stub';
import { sessionStubSpec } from './auth/session.stub.spec';
import { HttpClientTestingModule } from '@angular/common/http/testing';



const entryComponents = []
const components = [
  ...entryComponents,
  SpinnerLoadingStubComponent
]

const services = [
  IbHttpClientService,
  IbResponseHandlerService,
  { provide: IbAuthService, useValue: authServiceStub},
  { provide: LocalStorageService, useValue: localStorageStub },
  { provide: CookiesStorageService, useValue: cookiesStorageStub },
  { provide: IbSessionService, useValue: sessionStubSpec}
]


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
  ],
  entryComponents: [
    ...entryComponents
  ]
})
export class IbHttpTestModule { }
