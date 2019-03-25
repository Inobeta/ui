export class TableTitles {
  key: string;
  value: string;
  type: TableTitlesTypes = TableTitlesTypes.ANY;
  filterable = false;
  comboOptions?: any; // TableComboItem[];  <-- questa cosa è un mezzo casino da gestire con l'array
  format?: any;
  align?: TableCellAligns;
}

export enum TableTitlesTypes {
  ANY, DATE, TAG, NUMBER, HOUR, COMBOBOX, BUTTON, CHECKBOX, BOOLEAN
}
export enum TableCellAligns {
  LEFT= 'left', CENTER= 'center', RIGHT= 'right'
}

export class TableComboItem {
  label: string;
  value: any;
}
