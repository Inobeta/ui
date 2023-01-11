import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IbMainMenuButton } from '../../models/main-menu-button.model';
import { IbMainMenuData } from '../../models/main-menu-data.model';
import { IbMainMenuDialogComponent } from '../main-menu-dialog/main-menu-dialog.component';



@Component({
  selector: 'ib-main-menu-bar',
  templateUrl: './main-menu-bar.component.html',
  styleUrls: ['./main-menu-bar.component.css']
})
export class IbMainMenuBarComponent  {
/**
 * Dichiara l'icona da utilizzare per la menu bar principale, ovvero quella che al click apre il menu in forma estesa.
 * Used to declare the icon that must be used for the main menu bar, i.e the one that on click event opens the actual menu.
 */
  @Input() barIcon: string;

  /**
   * Dichiara il titolo dell'applicazione che viene visualizzato in alto a sinistra.
   * Used to declare the application title displayed on the up left of the menu.
   */
  @Input() navTitle: string;
  /**
   * Dichiara i dati per il bottone del menu che viene visualizzato in alto al centro, e che viene utilizzato per il ritorno alla pagina principale (home)
   * Used to declare data for the button displayed in the top center of the menu, which is used to go to the home page.
   */
  @Input() navButtonTopCenter: IbMainMenuButton;
  /**
   * Dichiara i dati per popolare le sezioni dei menu di primo livello e di secondo livello.
   * Used to declare data to initialize the first and second level menu sections.
   */
   @Input() navData: IbMainMenuData[];
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
  /**
   * Segnala il click avvenuto su un pulsante di menu che non ha l'attributo link definito.
   * Reports any click event happened on a menu button that doesn't have the link attribute set.
  */
  @Output() action: EventEmitter<IbMainMenuButton> = new EventEmitter<IbMainMenuButton>();

  temporaryWrapper: HTMLElement = this.renderer.createElement('div');


  constructor(
    public dialog: MatDialog,
    private renderer: Renderer2) {
      this.renderer.addClass(this.temporaryWrapper, 'blur-effect');
      this.renderer.appendChild(document.body, this.temporaryWrapper);
    }

  openDialog() {
    const dialogOpened = this.dialog.open(IbMainMenuDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      data: {
        title: this.navTitle,
        topCenter: this.navButtonTopCenter,
        upRight: this.navButtonsUpRight,
        navData: this.navData,
        bottomLeft: this.navBottomLeft,
        bottomRight: this.navButtonBottomRight
      },
      panelClass: 'mat-dialog-container-for-ib-main-menu'
    });


    this.addBlur();

    dialogOpened.afterClosed()
    .subscribe(result => {
      if(result) {
        this.action.emit(result);
      }
      this.removeBlur();
    })
  }

  addBlur() {
    this.temporaryWrapper.style.display = 'block';
    Array.prototype.slice.call(document.body.children).map( x => {
      x.classList.value === 'cdk-overlay-container' ||
      x.classList.value === 'blur-effect' ?
      null : this.renderer.appendChild(this.temporaryWrapper,x);
    });
  }

  removeBlur() {
    this.temporaryWrapper.style.display = 'none';
    Array.prototype.slice.call(this.temporaryWrapper.children).map( x => {
      this.renderer.appendChild(document.body,x);
      })
  }
}



