import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatOptionModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { IbUploaderComponent } from './uploader.component';

const entryComponents = [];
const components = [
  IbUploaderComponent
];

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
