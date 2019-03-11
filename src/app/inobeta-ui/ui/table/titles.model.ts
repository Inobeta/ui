export class TableTitles {
  key: string;
  value: string;
  type: TableTitlesTypes = TableTitlesTypes.ANY;
  filterable = false;
  comboOptions?: TableComboItem[];
  format?: any;
  align?: TableCellAligns;
}

export enum TableTitlesTypes {
  ANY, DATE, TAG, CHANNEL, NUMBER, HOUR, QUALITY, COMBOBOX, BUTTON, CHECKBOX
}
export enum TableCellAligns {
  LEFT= 'left', CENTER= 'center', RIGHT= 'right'
}

export class TableComboItem {
  label: string;
  value: any;
}
