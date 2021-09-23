import { Component, Input } from '@angular/core';
import { IbMainMenuData } from '../models/main-menu-data.model';
import  * as mainMenudata from '../main-menu-data.json'
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

  @Input() navData: IbMainMenuData[] = (mainMenudata as any).default;
  @Input() appTitle: string = 'DevKit';
  @Input() navUpRight: IbMainMenuButton [] = [{
      label: "settings",
      icon: "settings",
      link: ""
    },
    {
      label: "logout",
      icon: "logout",
      link: ""
    }
  ];
  @Input() navBottomLeft: IbMainMenuButton = {
    label: "Richiedi assistenza",
    icon: "help_outline",
    link: ""
  };
  @Input() navBottomRight: string = '© Inobeta 2021'

  constructor() {}

}
