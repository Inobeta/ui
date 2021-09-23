import { Component, Input } from '@angular/core';
import { IbMainMenuData } from '../models/main-menu-data.model';
//EXAMPLE_DATA
//import  * as mainMenudata from '../main-menu-data.json'
import { IbMainMenuButton } from '../models/main-menu-button.model';


@Component({
  selector: 'ib-main-menu',
  template: `
  <ib-main-menu-bar
    [navData]="navData"
    [navTitle]="appTitle"
    [navButtonsUpRight]="navUpRight"
    [navButtonBottomRight]="navBottomRight"
    [navBottomLeft]="navBottomLeft"
    >
  </ib-main-menu-bar>`,
})
export class IbMainMenuComponent {

  @Input() navData: IbMainMenuData[]; //EXAMPLE_DATA -> = (mainMenudata as any).default;
  @Input() appTitle: string;
  @Input() navUpRight: IbMainMenuButton[];
  @Input() navBottomLeft: IbMainMenuButton;
  @Input() navBottomRight: string;

  constructor() {}

}
