import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { IbUploaderComponent } from './uploader.component';

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
  providers: []
})
export class IbUploaderModule { }
