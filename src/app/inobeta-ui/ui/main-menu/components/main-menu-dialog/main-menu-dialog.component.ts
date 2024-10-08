import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, _closeDialogVia } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';

@Component({
  selector: 'ib-main-menu-dialog',
  template: `
    <mat-dialog-content (click)="this.dialogRef.close()">
      <ib-main-menu-expanded
        [navDataSet]="data"
        (actionDo)="actionDo($event)"
        >
      </ib-main-menu-expanded >
    </mat-dialog-content>
  `,
  styleUrls: ['./main-menu-dialog.component.css']
})
export class IbMainMenuDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<IbMainMenuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IbMainMenuDataSet,
    private router: Router) {}

  actionDo(element){

    this.dialogRef.close(element);
    if (element.link !== undefined) { this.router.navigate([element.link]); }
  }
}
