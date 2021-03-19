import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IbMaterialFormStubComponent } from './material-form/material-form.stub.spec';

const entryComponents = [
];
const components = [
  ...entryComponents,
  IbMaterialFormStubComponent
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    ...components
  ],
  declarations: [
    ...components
  ],
  providers: [],
  entryComponents: [
    ...entryComponents
  ]
})
export class IbMaterialFormTestModule { }
