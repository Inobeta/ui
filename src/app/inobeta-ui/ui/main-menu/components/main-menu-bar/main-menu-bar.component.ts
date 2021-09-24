import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IbMainMenuButton } from '../../models/main-menu-button.model';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';
import { IbMainMenuData } from '../../models/main-menu-data.model';
import { IbMainMenuDialogComponent } from '../main-menu-dialog/main-menu-dialog.component';



@Component({
  selector: 'ib-main-menu-bar',
  templateUrl: './main-menu-bar.component.html',
  styleUrls: ['./main-menu-bar.component.css']
})
export class IbMainMenuBarComponent implements OnInit {

  @Input() navData : IbMainMenuData[];
  @Input() navTitle: string;
  @Input() navButtonsUpRight: IbMainMenuButton[];
  @Input() navButtonBottomRight: string;
  @Input() navBottomLeft: IbMainMenuButton;

  dataSet: IbMainMenuDataSet;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataSet = {
      title: this.navTitle,
      upRight: this.navButtonsUpRight,
      navData: this.navData,
      bottomLeft: this.navBottomLeft,
      bottomRight: this.navButtonBottomRight
    }
  }

  openDialog() {
    this.dialog.open(IbMainMenuDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      data: this.dataSet,
      panelClass: 'mat-dialog-container-for-ib-main-menu'
      //panelClass here => C:\Users\rober\Desktop\Inobeta\Projects\devKit\inobeta-ui\src\app\inobeta-ui\themes\default.scss
    });

  }

}



