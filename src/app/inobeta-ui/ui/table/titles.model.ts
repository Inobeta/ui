import { ElementRef } from '@angular/core';

export enum TableTitlesTypes {
  ANY, DATE, TAG, NUMBER, HOUR, COMBOBOX, BUTTON, CHECKBOX, BOOLEAN, STRING, CUSTOMDATE
}
export enum TableCellAligns {
  LEFT= 'left', CENTER= 'center', RIGHT= 'right'
}

export class TableComboItem {
  label: string;
  value: any;
}

/**
 * class to format the CSS of the font of a specific column.
 * It is possible to change the color, weight and size of the font
 * through the optional "fontStyle" field of TableTitles
 */
export class FontStyleProperty {
  color?: string;
  fontWeight?: string;
  fontSize?: string;
}

export class TableTitles {
  key: string;
  value: string;
  type: TableTitlesTypes = TableTitlesTypes.ANY;
  filterable = false;
  comboOptions?: any; // TableComboItem[];  <-- questa cosa è un mezzo casino da gestire con l'array
  format?: any;
  align?: TableCellAligns;
  width = 'auto';
  templateHeaderClick?: ElementRef;
  fontStyle?: FontStyleProperty;
}

