import { Component, OnInit } from '@angular/core';
import { IbMainMenuButton } from 'src/app/inobeta-ui/ui/main-menu/models/main-menu-button.model';
import { IbMainMenuData } from 'src/app/inobeta-ui/ui/main-menu/models/main-menu-data.model';
import * as mainMenuData from './main-menu-data.json';

@Component({
  selector: 'ib-main-menu-example',
  template: `
    <ib-main-menu
      [navData]="exNavData"
      [appTitle]="exAppTitle"
      [navUpRight]="exNavUpRight"
      [navBottomLeft]="exNavBottomLeft"
      [navBottomRight]="exNavBottomRight"
    ></ib-main-menu>`
})
export class IbMainMenuExampleComponent implements OnInit {
   exNavData: IbMainMenuData[] = (mainMenuData as any).default;
   exAppTitle: string = 'DevKit';
   exNavUpRight: IbMainMenuButton[] = [{
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
   exNavBottomLeft: IbMainMenuButton = {
    label: "Richiedi assistenza",
    icon: "help_outline",
    link: ""
  };
   exNavBottomRight: string = '© Inobeta 2021'
  constructor() { }

  ngOnInit() {
  }

}
