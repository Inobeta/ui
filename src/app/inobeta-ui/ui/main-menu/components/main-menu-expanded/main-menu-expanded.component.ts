import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';
import { IbMainMenuDialogComponent } from '../main-menu-dialog/main-menu-dialog.component';

@Component({
  selector: 'ib-main-menu-expanded',
  templateUrl: './main-menu-expanded.component.html',
  styleUrls: ['./main-menu-expanded.component.css']
})
export class IbMainMenuExpandedComponent {
  @Input() navDataSet : IbMainMenuDataSet;

  constructor(
    public dialogRef: MatDialogRef<IbMainMenuDialogComponent>,
    ) {}

  closeDialog() {
    this.dialogRef.close();
  }

  calcBoxWidth(numElements) {
    let cost = Math.ceil(numElements/5);
    let width = cost * 232;
    numElements > 5 ? width = width + 10*cost*0.75 : null;
    return width + 'px';

  }

  calcSecondLevelWidth(numElements){
    return 100/Math.ceil(numElements/5) + '%';
  }

}
