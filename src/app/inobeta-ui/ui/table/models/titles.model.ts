import { ElementRef } from '@angular/core';
import { IbTableItem } from './table-item.model';

export enum IbTableTitlesTypes {
  ANY = 'any',
  DATE = 'date',
  TAG = 'tag', //#FIXME create a filter
  NUMBER = 'number',
  HOUR = 'hour', //#FIXME create a filter
  COMBOBOX = 'combobox', //#FIXME create a filter based on comboOptions
  BOOLEAN = 'boolean',
  STRING = 'string',
  INPUT_NUMBER = 'input-number', //#FIXME deprecated, this field will be removed
  CUSTOM = 'custom' //#FIXME deprecated, this field will be removed
}

export const ibTableSupportedFilters = [
  IbTableTitlesTypes.ANY,
  IbTableTitlesTypes.DATE,
  IbTableTitlesTypes.STRING,
  IbTableTitlesTypes.BOOLEAN,
  IbTableTitlesTypes.NUMBER,
  IbTableTitlesTypes.INPUT_NUMBER //#FIXME deprecated, this field will be removed
]

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
  filterable = false; //#FIXME change default with true
  comboOptions?: any; //#FIXME define a model for this
  format?: any;  //#FIXME change default to 1.2-2
  align?: IbTableCellAligns;
  width = 'auto';
  templateHeaderClick?: ElementRef;  //#FIXME rename or refactor. we need to override only filters template.
  className?: string;  //#FIXME duplicated by getClassByCondition
  placeHolderInput?: string;  //#FIXME deprecated: related to INPUT_NUMBER, this field will be removed
  getClassByCondition?: any;  //#FIXME duplicated by className
  change?: any;  //#FIXME deprecated: related to INPUT_NUMBER, this field will be removed
}

export class IbTableAction {
  label: string;
  color?: string;
  handler: (items: IbTableItem[]) => void;
}


export enum IbTableActionsPosition {
  BOTH, TOP, BOTTOM
}


