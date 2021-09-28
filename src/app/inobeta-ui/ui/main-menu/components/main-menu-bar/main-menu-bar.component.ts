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
/**
 * Dichiara l'icona da utilizzare per la menu bar principale, ovvero quella che al click apre il menu in forma estesa.
 * Used to declare the icon that must be used for the main menu bar, i.e the one that on click event opens the actual menu.
 */
  @Input() barIcon: string;
/**
 * Dichiara i dati per popolare le sezioni dei menu di primo livello e di secondo livello.
 * Used to declare data to initialize the first and second level menu sections.
 */
  @Input() navData: IbMainMenuData[];
  /**
   * Dichiara il titolo dell'applicazione che viene visualizzato in alto a sinistra.
   * Used to declare the application title displayed on the up left of the manu.
   */
  @Input() navTitle: string;
  /**
   * Dichiara i dati per i 2 bottoni del menu che vengono visualizzati in alto a destra.
   * Used to declare data for the 2 buttons displayed on the up right of the menu.
   */
  @Input() navButtonsUpRight: IbMainMenuButton[];
  /**
   * Dichiara una stringa che sarà visualizzata in basso a destra, e che viene utilizzata per indicare il copyright.
   * Used to declare a string which will be displayed on the bottom right, which can be used to declare the copyright.
   */
  @Input() navButtonBottomRight: string;
  /**
   * Dichiara i dati per il bottone del menu che viene visualizzato in basso a sinistra, e che viene utilizzato per il tasto di assistenza.
   * Used to declare data for the button displayed on the bottom left  of the menu, which can be used as a 'get help' button.
   */
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
    });

  }

}



