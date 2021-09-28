import { Component, OnInit } from '@angular/core';
import { IbMainMenuButton } from 'src/app/inobeta-ui/ui/main-menu/models/main-menu-button.model';
import { IbMainMenuData } from 'src/app/inobeta-ui/ui/main-menu/models/main-menu-data.model';
import * as mainMenuData from './main-menu-data.json';

@Component({
  selector: 'ib-main-menu-example',
  template: `
    <ib-main-menu-bar
      [barIcon]="exMenuIconBar"
      [navData]="exNavData"
      [navTitle]="exAppTitle"
      [navButtonsUpRight]="exNavUpRight"
      [navBottomLeft]="exNavBottomLeft"
      [navButtonBottomRight]="exNavBottomRight"
    ></ib-main-menu-bar>`
})
export class IbMainMenuExampleComponent implements OnInit {
  exMenuIconBar: string = 'apps';
  exNavData: IbMainMenuData[] = (mainMenuData as any).default;
  exAppTitle: string = 'examples.ibMainMenu.title';
  exNavUpRight: IbMainMenuButton[] = [{
      label: "examples.ibMainMenu.settings",
      icon: "settings",
      link: "home/forms"
    },
    {
      label: "examples.ibMainMenu.logout",
      icon: "logout",
      link: "home/table"
    }
  ];
   exNavBottomLeft: IbMainMenuButton = {
    label: "examples.ibMainMenu.getHelp",
    icon: "help_outline",
    link: "home/table"
  };
   exNavBottomRight: string = 'examples.ibMainMenu.copyright'
  constructor() { }

  ngOnInit() {
  }

}
