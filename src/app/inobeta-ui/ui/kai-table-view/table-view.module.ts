import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { IbTableViewGroup } from './table-view.component';

@NgModule({
  imports: [CommonModule, MatTabsModule, MatIconModule, MatButtonModule],
  exports: [IbTableViewGroup],
  declarations: [IbTableViewGroup],
  providers: [],
})
export class IbTableViewModule { }
