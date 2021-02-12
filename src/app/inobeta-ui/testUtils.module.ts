import {NgModule} from '@angular/core';


export const testComponents = [
];

export const testServices = [

];

export const testImports = [

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
