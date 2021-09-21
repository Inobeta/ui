import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IbMainMenuDialogComponent } from '../main-menu-dialog/main-menu-dialog.component';

@Component({
  selector: 'ib-main-menu-expanded',
  templateUrl: './main-menu-expanded.component.html',
  styleUrls: ['./main-menu-expanded.component.css']
})
export class IbMainMenuExpandedComponent {

  constructor(
    public dialogRef: MatDialogRef<IbMainMenuDialogComponent>
    ) {}

    closeDialog() { this.dialogRef.close();}
}
