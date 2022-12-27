import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, _closeLegacyDialogVia as _closeDialogVia } from '@angular/material/legacy-dialog';
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
