import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs'; 
import { IbFilterClassic } from './filter-classic/filter-classic.component';

import { IbFilterList } from './filter-list/filter-list.component';
import { IbFilterTag } from './filter-tag/filter-tag.component';
import { IbFilter } from './filter.component';

@NgModule({
  imports: [
    CommonModule,
    PortalModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule
  ],
  exports: [IbFilter, IbFilterClassic, IbFilterTag],
  declarations: [IbFilter, IbFilterList, IbFilterClassic, IbFilterTag],
  providers: [],
})
export class IbFilterModule { }
