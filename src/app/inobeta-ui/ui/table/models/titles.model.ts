import { ElementRef } from '@angular/core';
import { IbTableItem } from './table-item.model';

export enum IbTableTitlesTypes {
  ANY = 'any',
  DATE = 'date',
  TAG = 'tag', // #FIXME create a filter
  NUMBER = 'number',
  HOUR = 'hour', // #FIXME create a filter
  COMBOBOX = 'combobox', // #FIXME create a filter based on comboOptions
  BOOLEAN = 'boolean',
  STRING = 'string',
  /**
   * @deprecated do not use this enum type. It will be removed in a future release
   */
  INPUT_NUMBER = 'input-number',
  /**
   * @deprecated do not use this enum type. It will be removed in a future release
   */
  CUSTOM = 'custom'
}

export const ibTableSupportedFilters = [
  IbTableTitlesTypes.ANY,
  IbTableTitlesTypes.DATE,
  IbTableTitlesTypes.STRING,
  IbTableTitlesTypes.BOOLEAN,
  IbTableTitlesTypes.NUMBER,
  IbTableTitlesTypes.INPUT_NUMBER
];

export enum IbTableCellAligns {
  LEFT= 'left', CENTER= 'center', RIGHT= 'right'
}

export class IbTableComboItem {
  label: string;
  value: any;
}

export class IbTableTitles {
  key: string;
  value: string;
  type: IbTableTitlesTypes = IbTableTitlesTypes.ANY;
  filterable = false; // #FIXME change default with true
  comboOptions?: any; // #FIXME define a model for this
  format?: any;  // #FIXME change default to 1.2-2
  align?: IbTableCellAligns;
  width = 'auto';
  /**
   * @deprecated
   */
  showTotalSum? = false;
  /**
   * @deprecated do not use this field, it will be removed in a future release
   */
  templateHeaderClick?: ElementRef;
  /**
   * @deprecated use getClassByCondition please
   */
  className?: string;
  /**
   * @deprecated related to INPUT_NUMBER, this field will be removed
   */
  placeHolderInput?: string;
  getClassByCondition?: any;
  /**
   * @deprecated related to INPUT_NUMBER, this field will be removed
   */
  change?: any;
  /**
   * @member
   * Utilizzare `true` o `start` per "attaccare" le colonne a sinistra,
   * `end`, invece, sulla parte destra.
   */
  sticky? = undefined;
}

export class IbTableAction {
  label: string;
  color?: string;
  handler: (items: IbTableItem[]) => void;
}


export enum IbTableActionsPosition {
  BOTH, TOP, BOTTOM
}

export enum IbStickyAreas {
  HEADER, FOOTER, SELECT, DELETE, EDIT, TEMPLATE, SETTINGS
}

