import { NgModule } from '@angular/core';
import { MaterialFormComponent } from './material-form/material-form.component';
import { MaterialFormControlComponent } from './material-form-control/material-form-control.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatOptionModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';

const entryComponents = []
const components = [
  ...entryComponents,
  MaterialFormComponent,
  MaterialFormControlComponent,
]


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    TranslateModule.forChild({
      extend: true
  }),
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
export class MaterialFormModule { }
