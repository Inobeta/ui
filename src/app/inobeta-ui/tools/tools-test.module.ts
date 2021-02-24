import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IbMockTranslatePipeDirective } from './stubs/mock-translate.directive.stub.spec';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceStub } from './stubs/translate.service.stub.spec';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeIt, 'it');

const entryComponents = []
const components = [
  ...entryComponents,
  IbMockTranslatePipeDirective
]

const services = [
  { provide: TranslateService, useValue: translateServiceStub},
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
export class IbToolTestModule { }
