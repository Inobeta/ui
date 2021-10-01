import { IbMainMenuButton } from "./main-menu-button.model";

export interface IbMainMenuData extends IbMainMenuButton {
  paths?: IbMainMenuData []
}
