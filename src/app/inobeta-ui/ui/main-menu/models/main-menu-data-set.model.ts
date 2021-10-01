import { IbMainMenuButton } from "./main-menu-button.model";
import { IbMainMenuData } from "./main-menu-data.model";
/**
 * Composition of the data models the <ib-main-menu-bar> receives, so that they can be sent to the <ib-main-menu-dialog> as a unique variable.
 */
export interface IbMainMenuDataSet {
  title: string,
  topCenter: IbMainMenuButton,
  upRight: IbMainMenuButton[],
  navData: IbMainMenuData[],
  bottomRight: string,
  bottomLeft: IbMainMenuButton
}
