import {NgModule} from '@angular/core';
import {MockTranslatePipeDirective} from './stubs/mockTranslatePipe.directive';
import {AuthService} from './auth/auth.service';
import {authServiceStub} from './auth/auth.service.stub';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import {localStorageStub} from './auth/localStorage.stub';
import {cookiesStorageStub} from './auth/cookiesStorage.stub';
import {HttpClientService} from './http/httpclient.service';
import {ResponseHandlerService} from './http/responseHandler.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateService} from '@ngx-translate/core';
import {TranslateServiceStub} from './stubs/translate.service.stub';

export const testComponents = [
  MockTranslatePipeDirective,
];

export const testServices = [
  HttpClientService,
  ResponseHandlerService,
  { provide: AuthService, useValue: authServiceStub},
  { provide: LocalStorageService, useValue: localStorageStub },
  { provide: CookiesStorageService, useValue: cookiesStorageStub },
  { provide: TranslateService, useValue: TranslateServiceStub}
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
