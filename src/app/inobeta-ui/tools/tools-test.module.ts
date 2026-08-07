import { NgModule } from '@angular/core';
import { IbMockTranslatePipeDirective } from './stubs/mock-translate.directive.stub.spec';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceStub } from './stubs/translate.service.stub.spec';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { MatDialogRef } from '@angular/material/dialog';
import { serviceDialogStub } from './stubs/dialog.stub.spec';

registerLocaleData(localeIt, 'it');

const components = [
  IbMockTranslatePipeDirective
];

const services = [
  { provide: TranslateService, useValue: translateServiceStub },
  { provide: MatDialogRef, useValue: serviceDialogStub }
];


@NgModule({
  exports: [
    ...components
  ],
  declarations: [
    ...components
  ], imports: [], providers: [
    ...services
  ]
})
export class IbToolTestModule { }
