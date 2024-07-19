import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IbMainMenuBarComponent } from './components/main-menu-bar/main-menu-bar.component';
import { IbMainMenuDialogComponent } from './components/main-menu-dialog/main-menu-dialog.component';
import { IbMainMenuHeaderFooterButtonsComponent } from './components/main-menu-expanded/header-footer-buttons.component';
import { IbMainMenuExpandedComponent } from './components/main-menu-expanded/main-menu-expanded.component';

@NgModule({
  declarations: [
    IbMainMenuBarComponent,
    IbMainMenuDialogComponent,
    IbMainMenuExpandedComponent,
    IbMainMenuHeaderFooterButtonsComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    RouterModule,
    TranslateModule.forChild({
      extend: true
    }),
  ],
  exports: [
    IbMainMenuBarComponent,
    IbMainMenuDialogComponent,
    IbMainMenuExpandedComponent,
    IbMainMenuHeaderFooterButtonsComponent
  ]
})
export class IbMainMenuModule { }
