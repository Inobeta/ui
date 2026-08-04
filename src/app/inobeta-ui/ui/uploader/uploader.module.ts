import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { IbUploaderComponentLegacy } from './uploader.component';

const components = [
  IbUploaderComponentLegacy
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
/** @deprecated this element will be removed in v21 */
export class IbUploaderModule { }
