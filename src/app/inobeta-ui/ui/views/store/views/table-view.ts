export interface IView<T = any> {
  id: string;
  name: string;
  groupName: string;
  data: T;
}

export interface ITableViewData {
  filter?: Record<string, any>;
  pageSize?: number;
}

export class IbView<T> implements IView {
  id: string;
  name: string;
  groupName: string;
  data: T;

  constructor(view: Partial<IView>) {
    this.id = view?.id ?? btoa(Math.random().toString());
    this.name = view?.name;
    this.groupName = view?.groupName;
    this.data = view?.data;
  }
}