import { Component, Input } from '@angular/core';
import { IbMainMenuButton } from '../../models/main-menu-button.model';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';
import { IbMainMenuData } from '../../models/main-menu-data.model';



@Component({
  selector: 'ib-main-menu-bar',
  template: ''
})
export class IbMainMenuBarStubComponent {

  @Input() barIcon: string;
  @Input() navData: IbMainMenuData[];
  @Input() navTitle: string;
  @Input() navButtonsUpRight: IbMainMenuButton[];
  @Input() navButtonBottomRight: string;
  @Input() navBottomLeft: IbMainMenuButton;

  dataSet: IbMainMenuDataSet;

  constructor() {}

  openDialog() {}

}



