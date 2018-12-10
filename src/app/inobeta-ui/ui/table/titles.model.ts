export class TableTitles {
  key: string;
  value: string;
  type: TableTitlesTypes = TableTitlesTypes.ANY;
  filterable = false;
  comboOptions?: TableComboItem[];
}

export enum TableTitlesTypes {
  ANY, DATE, TAG, CHANNEL, NUMBER, HOUR, QUALITY, COMBOBOX, BUTTON, CHECKBOX
}

export class TableComboItem {
  label: string;
  value: any;
}
