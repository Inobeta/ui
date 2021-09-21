import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, _closeDialogVia } from '@angular/material/dialog';

@Component({
  selector: 'ib-main-menu-dialog',
  template: `
    <ng-container>
      <ib-main-menu-expanded></ib-main-menu-expanded>
    </ng-container>
  `
})
export class IbMainMenuDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<IbMainMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}
}
