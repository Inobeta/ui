import { IbMainMenuButton } from "./main-menu-button.model";
import { IbMainMenuData } from "./main-menu-data.model";

export interface IbMainMenuDataSet {
  title: string,
  upRight: IbMainMenuButton[],
  navData: IbMainMenuData[],
  bottomRight: string,
  bottomLeft: IbMainMenuButton
}
