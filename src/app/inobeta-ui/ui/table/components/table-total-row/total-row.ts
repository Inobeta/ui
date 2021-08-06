import { IbTableItem } from "../../models/table-item.model";
import { IbTableTitles, IbTableTitlesTypes } from "../../models/titles.model";

export class TotalRow {
  columns = {};

  apply(functionName: string, data: IbTableItem[], key: string) {
    if (functionName === 'sum') {
      return data.reduce((acc, cur) => acc + cur[key], 0);
    }

    if (functionName === 'avg') {
      return data.reduce((acc, cur) => acc + cur[key], 0) / data.length;
    }
  }

  toggle(key: string, functionName: string) {
    this.columns[key] = functionName;
  }

  private shouldShowTotal(key: string) {
    return key in this.columns;
  }

  private isRowTypeSupported(title: IbTableTitles) {
    return title.type === IbTableTitlesTypes.NUMBER;
  }
}
