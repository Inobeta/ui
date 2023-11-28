import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbStickyColumnDirective } from './sticky-column.directive';

@NgModule({
  declarations: [IbStickyColumnDirective],
  imports: [
    CommonModule
  ],
  exports: [IbStickyColumnDirective]
})

/**
* @deprecated Use IbKaiTableModule
*/
export class IbStickyAreaModule { }
