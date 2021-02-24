import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceStub } from './stubs/translate.service.stub.spec';
import { IbMockTranslatePipeDirective } from './stubs/mock-translate.directive.stub.spec';
import { MatDialogRef } from '@angular/material';
import { serviceDialogStub } from './stubs/dialog.stub.spec';



const entryComponents = []
const components = [
  ...entryComponents,
  IbMockTranslatePipeDirective
]

const services = [
  { provide: TranslateService, useValue: translateServiceStub},
  { provide: MatDialogRef, useValue: serviceDialogStub}
]


@NgModule({
  imports: [
    HttpClientTestingModule
  ],
  exports: [
    ...components,
    ...services
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
