import {NgModule} from '@angular/core';
import {MockTranslatePipeDirective} from './mockTranslatePipe.directive';

export const testComponents = [
  MockTranslatePipeDirective
];

export const testServices = [];

export const testImports = [];

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
