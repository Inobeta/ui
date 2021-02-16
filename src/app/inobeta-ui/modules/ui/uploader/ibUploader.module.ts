import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatOptionModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { UploaderComponent } from './uploader.component';

const entryComponents = []
const components = [
  ...entryComponents,
  UploaderComponent
]


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    TranslateModule.forChild({
      extend: true
  }),
    MatButtonModule
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
export class IbUploaderModule { }
