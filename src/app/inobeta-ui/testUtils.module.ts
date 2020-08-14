import {NgModule} from '@angular/core';
import {MockTranslatePipeDirective} from './stubs/mockTranslatePipe.directive';
import {AuthService} from './auth/auth.service';
import {authServiceStub} from './stubs/auth.service.stub';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import {localStorageStub} from './stubs/localStorage.stub';
import {cookiesStorageStub} from './stubs/cookiesStorage.stub';
import {HttpClientService} from './http/httpclient.service';
import {ResponseHandlerService} from './http/responseHandler.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateService} from '@ngx-translate/core';
import {TranslateServiceStub} from './stubs/translate.service.stub';
import { TableStubComponent } from './stubs/table.stub.spec';
import {SessionService} from './auth/session.service';
import {sessionStubSpec} from './stubs/session.stub.spec';
import { SpinnerLoadingStubComponent } from './stubs/spinnerLoading.stub.spec';

export const testComponents = [
  MockTranslatePipeDirective,
  TableStubComponent,
  SpinnerLoadingStubComponent
];

export const testServices = [
  HttpClientService,
  ResponseHandlerService,
  { provide: AuthService, useValue: authServiceStub},
  { provide: LocalStorageService, useValue: localStorageStub },
  { provide: CookiesStorageService, useValue: cookiesStorageStub },
  { provide: TranslateService, useValue: TranslateServiceStub},
  { provide: SessionService, useValue: sessionStubSpec}
];

export const testImports = [
  HttpClientTestingModule
];

@NgModule({
  declarations: [
    ...testComponents
  ],
  imports: [
    ...testImports
  ],
  exports: [
    ...testComponents
  ],
  providers: [
    ...testServices
  ],
  entryComponents: []
})
export class TestUtilsModule { }
