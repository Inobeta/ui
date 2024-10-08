import { Component } from '@angular/core';
import { IbMainMenuButton } from 'src/app/inobeta-ui/ui/main-menu/models/main-menu-button.model';
import { IbMainMenuData } from 'src/app/inobeta-ui/ui/main-menu/models/main-menu-data.model';
import * as mainMenuData from './main-menu-data.json';

@Component({
  selector: 'ib-main-menu-example',
  template: `
    <ib-main-menu-bar
      [barIcon]="exMenuIconBar"
      [navTitle]="exAppTitle"
      [navButtonTopCenter]="exNavTopCenter"
      [navButtonsUpRight]="exNavUpRight"
      [navData]="exNavData"
      [navBottomLeft]="exNavBottomLeft"
      [navButtonBottomRight]="exNavBottomRight"
      (action)="handleMenuClick($event)"
    ></ib-main-menu-bar>`
})
export class IbMainMenuExampleComponent {

  exMenuIconBar: string = 'apps';

  exAppTitle: string = 'examples.ibMainMenu.title';

  exNavTopCenter: IbMainMenuButton = {
    label: 'shared.ibMainMenu.returnToDash',
    link: 'home/table/redux',
    icon: {label:'dashboard',type:'filled'}
  };

  exNavData: IbMainMenuData[] = (mainMenuData as any).default;

  exNavUpRight: IbMainMenuButton[] = [{
      label: "examples.ibMainMenu.settings",
      icon: {label: "settings", type:"two-tone"},
      link: "home/forms"
    },
    {
      label: "examples.ibMainMenu.logout",
      icon: {label:"exit_to_app", type: "two-tone"}
    }
  ];

  exNavBottomLeft: IbMainMenuButton = {
    label: "examples.ibMainMenu.getHelp",
    icon: {label:"help_outline", type:""},
    link: "home/forms"

  };

  exNavBottomRight: string = 'examples.ibMainMenu.copyright'

  constructor() { }

  handleMenuClick(who){
    //switch(who.label){
    //  case 'examples.ibMainMenu.logout': console.log('Emitted logout OK'); break;
    //  case 'examples.ibMainMenu.getHelp': console.log(' Emitted getHelp OK'); break;
    //}
    console.log('Emitted', who.label);

  }
}
