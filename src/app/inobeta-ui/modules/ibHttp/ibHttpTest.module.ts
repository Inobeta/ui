import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientService } from './http/httpclient.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ResponseHandlerService } from './http/responseHandler.service';
import { AuthService } from './auth/auth.service';
import { SessionService } from './auth/session.service';
import { LocalStorageService, CookiesStorageService } from 'ngx-store';
import { SpinnerLoadingStubComponent } from './http/spinnerLoading.stub.spec';
import { authServiceStub } from './auth/auth.service.stub';
import { localStorageStub } from './auth/localStorage.stub';
import { cookiesStorageStub } from './auth/cookiesStorage.stub';
import { sessionStubSpec } from './auth/session.stub.spec';
import { HttpClientTestingModule } from '@angular/common/http/testing';



const entryComponents = []
const components = [
  ...entryComponents,
  SpinnerLoadingStubComponent
]

const services = [
  HttpClientService,
  ResponseHandlerService,
  { provide: AuthService, useValue: authServiceStub},
  { provide: LocalStorageService, useValue: localStorageStub },
  { provide: CookiesStorageService, useValue: cookiesStorageStub },
  { provide: SessionService, useValue: sessionStubSpec}
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
