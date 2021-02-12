import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockTranslatePipeDirective } from './stubs/mockTranslatePipe.directive';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from './stubs/translate.service.stub';



const entryComponents = []
const components = [
  ...entryComponents,
  MockTranslatePipeDirective
]

const services = [
  { provide: TranslateService, useValue: TranslateServiceStub},
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
