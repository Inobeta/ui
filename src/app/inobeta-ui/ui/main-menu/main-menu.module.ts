import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbMainMenuComponent } from './main-menu.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { IbMainMenuBarComponent } from './main-menu-bar/main-menu-bar.component';
import { IbMainMenuExpandedComponent } from './main-menu-expanded/main-menu-expanded.component';
import { IbMainMenuDialogComponent } from './main-menu-dialog/main-menu-dialog.component';



@NgModule({
  declarations: [
    IbMainMenuComponent,
    IbMainMenuBarComponent,
    IbMainMenuDialogComponent,
    IbMainMenuExpandedComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  exports: [
    IbMainMenuComponent,
    IbMainMenuBarComponent,
    IbMainMenuDialogComponent,
    IbMainMenuExpandedComponent
  ]
})
export class IbMainMenuModule { }
