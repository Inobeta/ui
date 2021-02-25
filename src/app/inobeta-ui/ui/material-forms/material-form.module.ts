import { NgModule } from '@angular/core';
import { IbMaterialFormComponent } from './material-form/material-form.component';
import { IbMaterialFormControlComponent } from './material-form-control/material-form-control.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatOptionModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';

const entryComponents = [];
const components = [
  ...entryComponents,
  IbMaterialFormComponent,
  IbMaterialFormControlComponent,
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forChild({
      extend: true
    }),
    MatButtonModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatInputModule
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
export class IbMaterialFormModule { }
