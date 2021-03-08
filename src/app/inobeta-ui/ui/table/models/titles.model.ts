import { ElementRef } from '@angular/core';

export enum IbTableTitlesTypes {
  ANY, DATE, TAG, NUMBER, HOUR, COMBOBOX, BUTTON, CHECKBOX, BOOLEAN, STRING, CUSTOMDATE, MATERIAL_SELECT, INPUT_NUMBER, CUSTOM
}
export enum IbTableCellAligns {
  LEFT= 'left', CENTER= 'center', RIGHT= 'right'
}

export class IbTableComboItem {
  label: string;
  value: any;
}

export class IbMaterialSelectComboItem {
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
  materialSelectItems?: IbMaterialSelectComboItem[];
  placeHolderInput?: string;
  getClassByCondition?: any;
  change?: any;
}

