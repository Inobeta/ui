import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IbMaterialFormStubComponent } from './material-form/material-form.stub.spec';


const components = [
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
  providers: []
})
export class IbMaterialFormTestModule { }
