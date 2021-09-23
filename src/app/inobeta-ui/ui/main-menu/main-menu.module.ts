import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbMainMenuComponent } from './pages/main-menu.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { IbMainMenuBarComponent } from './components/main-menu-bar/main-menu-bar.component';
import { IbMainMenuExpandedComponent } from './components/main-menu-expanded/main-menu-expanded.component';
import { IbMainMenuDialogComponent } from './components/main-menu-dialog/main-menu-dialog.component';
import { RouterModule } from '@angular/router';

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
    FlexLayoutModule,
    RouterModule
  ],
  exports: [
    IbMainMenuComponent,
    IbMainMenuBarComponent,
    IbMainMenuDialogComponent,
    IbMainMenuExpandedComponent
  ]
})
export class IbMainMenuModule { }
