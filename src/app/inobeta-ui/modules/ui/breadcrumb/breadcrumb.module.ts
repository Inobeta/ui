import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbBreadcrumbComponent } from './breadcrumb.component';
import { RouterModule } from '@angular/router';
import { IbMaterialBreadcrumbComponent } from './material-breadcrumb/material-breadcrumb.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material';

@NgModule({
  declarations: [
    IbBreadcrumbComponent,
    IbMaterialBreadcrumbComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule.forChild({
        extend: true
    }),
    MatIconModule
  ],
  exports: [
    IbBreadcrumbComponent,
    IbMaterialBreadcrumbComponent
  ]
})
export class IbBreadcrumbModule { }
