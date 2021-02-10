import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './breadcrumb.component';
import { RouterModule } from '@angular/router';
import { MaterialBreadcrumbComponent } from './material-breadcrumb/material-breadcrumb.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material';

@NgModule({
  declarations: [
    BreadcrumbComponent,
    MaterialBreadcrumbComponent
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
    BreadcrumbComponent,
    MaterialBreadcrumbComponent
  ]
})
export class BreadcrumbModule { }
