import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, _closeDialogVia } from '@angular/material/dialog';
import { IbMainMenuData } from '../main-menu-data.model';

@Component({
  selector: 'ib-main-menu-dialog',
  template: `
    <mat-dialog-content>
      <ib-main-menu-expanded
        [navData]="data">
      </ib-main-menu-expanded>
    </mat-dialog-content>
  `,
  styleUrls: ['./main-menu-dialog.component.css']
})
export class IbMainMenuDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<IbMainMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IbMainMenuData []) {}
}
