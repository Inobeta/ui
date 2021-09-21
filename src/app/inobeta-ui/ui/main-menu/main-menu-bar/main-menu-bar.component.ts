import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IbMainMenuDialogComponent } from '../main-menu-dialog/main-menu-dialog.component';

@Component({
  selector: 'ib-main-menu-bar',
  templateUrl: './main-menu-bar.component.html',
  styleUrls: ['./main-menu-bar.component.css']
})
export class IbMainMenuBarComponent implements OnInit {

  @Input() navData = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
  }

  openDialog() {
    this.dialog.open(IbMainMenuDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      data: this.navData
    });
    //dialogRef.afterClosed().subscribe(result => {
    //  console.log(`Dialog result: ${result}`);
    //});
  }

}



