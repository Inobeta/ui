import { ElementRef } from '@angular/core';
import { IbTableItem } from './table-item.model';

export enum IbTableTitlesTypes {
  ANY = 'any',
  DATE = 'date',
  TAG = 'tag',
  NUMBER = 'number',
  HOUR = 'hour',
  COMBOBOX = 'combobox',
  BOOLEAN = 'boolean',
  STRING = 'string',
  INPUT_NUMBER = 'input-number',
  CUSTOM = 'custom'
}

export const ibTableSupportedFilters = [
  IbTableTitlesTypes.ANY,
  IbTableTitlesTypes.DATE,
  IbTableTitlesTypes.STRING,
  IbTableTitlesTypes.BOOLEAN,
  IbTableTitlesTypes.NUMBER,
  IbTableTitlesTypes.INPUT_NUMBER
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
  filterable = false;
  comboOptions?: any; // IbTableComboItem[];  <-- questa cosa è un mezzo casino da gestire con l'array
  format?: any;
  align?: IbTableCellAligns;
  width = 'auto';
  templateHeaderClick?: ElementRef;
  className?: string;
  placeHolderInput?: string;
  getClassByCondition?: any;
  change?: any;
}

export class IbTableAction {
  label: string;
  color?: string;
  handler: (items: IbTableItem[]) => void;
}

