import { ComponentType } from "@angular/cdk/portal";
import { MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";
import { IbCell } from "./cells";

export interface IbColumnDef<T = any> {
  /**
   * Unique name for this column.
   * Note: if `sort` is true, then this property **must** match the name
   * of the respective element property.
   * @example
   * columnDef: 'author'
   */
  columnDef: string;
  /**
   * Column name to display.
   * It also accepts translation ids.
   * @example
   * header: 'Author'
   */
  header: string;
  /** If true, enables data sorting for this column. */
  sort?: boolean;
  /**
   * @description
   * Gets a reference to an element of the data array.
   * Used as a data accessor, it formats the inner text of the cell.
   * @example
   * (book: Book) => `${book.author}`
   * @param element A row instance
   * @returns {string}
   */
  cell: (element: T) => string | any;
  /**
   * @description
   * Custom cell component.
   * Accepts any component that extends `IbCell`
   *
   * @example
   * ＠Component({
   *  selector: 'ib-tag-cell',
   *  template: '<span>{{column.cell(row)}}<span>',
   *  styles: [`
   *    span {
   *      color: white;
   *      background-color: peach;
   *      padding: 2px 10px;
   *      border-radius: 4px;
   *  }`]
   * })
   * export class MnTagCell extends IbCell { }
   * // ...
   * columns = [{
   *   columnDef: 'author',
   *   header: 'terms.author',
   *   cell: (element) => `${element.author}`,
   *   component: MnTagCell,
   * }]
   */
  component?: ComponentType<IbCell>;
}

export interface IbPaginatorOptions extends MatPaginatorDefaultOptions {
  hide?: boolean;
}

export interface IbTableDef {
  paginator?: IbPaginatorOptions;
  initialSort?: Sort;
}

export interface IbCellData<T = any> {
  column: IbColumnDef<T>;
  row: any;
  send: (event: Partial<IbTableRowEvent>) => void;
}

export interface IbTableRowEvent<T = any> {
  tableName: string;
  type: string;
  row: T;
}
