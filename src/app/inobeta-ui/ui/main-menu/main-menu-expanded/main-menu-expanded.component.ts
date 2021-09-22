import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IbMainMenuData } from '../main-menu-data.model';
import { IbMainMenuDialogComponent } from '../main-menu-dialog/main-menu-dialog.component';

@Component({
  selector: 'ib-main-menu-expanded',
  templateUrl: './main-menu-expanded.component.html',
  styleUrls: ['./main-menu-expanded.component.css']
})
export class IbMainMenuExpandedComponent implements OnInit{
  @Input() navData : IbMainMenuData [] = [];

  constructor(
    public dialogRef: MatDialogRef<IbMainMenuDialogComponent>
    ) {}

  ngOnInit() {
    console.log("navData", this.navData)
  }

  closeDialog() { this.dialogRef.close();}

}
