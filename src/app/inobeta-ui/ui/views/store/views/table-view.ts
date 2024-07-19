import { Sort } from "@angular/material/sort";
import { IbFilterSyntaxExtended } from "../../../kai-filter";

export interface IView {
  id: string;
  name: string;
  groupName: string;
  data: ITableViewData;
  initial?: boolean;
}

export interface ITableViewData {
  filter: IbFilterSyntaxExtended;
  pageSize: number;
  aggregatedColumns: Record<string, string>;
  sort: Sort;
}

export class IbView implements IView {
  id: string;
  name: string;
  groupName: string;
  data: ITableViewData;

  constructor(view: Partial<IView>) {
    this.id = view?.id ?? btoa(Math.random().toString());
    this.name = view?.name;
    this.groupName = view?.groupName;
    this.data = view?.data;
  }
}
