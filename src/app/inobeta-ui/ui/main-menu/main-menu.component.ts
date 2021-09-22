import { Component, OnInit } from '@angular/core';
import { IbMainMenuData } from './main-menu-data.model';
import  * as mainMenudata from './main-menu-data.json'


@Component({
  selector: 'ib-main-menu',
  template: `
  <ib-main-menu-bar
    [navData]="data">

  </ib-main-menu-bar>`,
})
export class IbMainMenuComponent implements OnInit {

  data: IbMainMenuData[] = (mainMenudata as any).default;

  constructor() {}

  ngOnInit(): void {
    console.log(this.data);
  }




}
