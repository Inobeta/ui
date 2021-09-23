import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';
import { IbMainMenuDialogComponent } from '../main-menu-dialog/main-menu-dialog.component';

@Component({
  selector: 'ib-main-menu-expanded',
  templateUrl: './main-menu-expanded.component.html',
  styleUrls: ['./main-menu-expanded.component.css']
})
export class IbMainMenuExpandedComponent implements OnInit{
  @Input() navDataSet : IbMainMenuDataSet;

  constructor(
    public dialogRef: MatDialogRef<IbMainMenuDialogComponent>,
    private route: Router
    ) {}

  ngOnInit() {
    console.log("navData", this.navDataSet)
  }

  closeDialog() { this.dialogRef.close();}

}
