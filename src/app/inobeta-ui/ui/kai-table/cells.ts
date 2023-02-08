import { formatDate, formatNumber } from "@angular/common";
import { Component, ChangeDetectionStrategy, Inject, Optional } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { IB_CELL_DATA } from "./table.component";
import { IbCellData, IbColumnDef } from "./table.types";

@Component({
  selector: 'ib-cell',
  template: '<div class="ib-cell-{{this.column.columnDef}}">{{column.cell(row)}}</div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IbCell {
  get cell() { return this.data.column.cell(this.data.row) }
  get column() { return this.data.column }
  get row() { return this.data.row }
  get send() { return this.data.send }

  constructor(@Inject(IB_CELL_DATA) @Optional() public data: IbCellData) { }
}

interface IbContextAction {
  /** Unique action type identifier. Used in `IbTableRowEvent.type` */
  type: string;
  /** Icon name for the action. Only supports material icons names. */
  icon?: string;
}

@Component({
  selector: 'ib-cell-ctx',
  template: `<div *ngFor="let action of actions" class="action-section ib-action-{{action.type}}">
    <button mat-icon-button (click)="send({ type: action.type, row: row })">
      <mat-icon>{{ action?.icon ?? action.type }}</mat-icon>
    </button>
</div>`,
  styles: [`
  :host {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
  }

  .button-infos {
    cursor: pointer;
    user-select: none;
  }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IbContextActionCell extends IbCell {
  get actions(): IbContextAction[] { return this.data.column.cell(this.data.row) }
}

@Component({
  selector: 'ib-cell-translate',
  template: `{{text()}}`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IbTranslateCell extends IbCell {
  text = () => this.translate.instant(this.cell.key, this.cell.params);
  constructor(
    @Inject(IB_CELL_DATA) @Optional() public data: IbCellData,
    public translate: TranslateService) {
    super(data);
  }
}

/**
 *
 * @param {cell} cell - Data accessor. Same as `IbColumnDef.cell`, but returns
 *  an {IbContextAction} array.
 * @returns
 */
export const useContextCell = <T>(cell: (e: T) => IbContextAction[]): IbColumnDef => ({
  component: IbContextActionCell,
  columnDef: '_ctxActions',
  header: '',
  cell,
})
export const useContextColumn = useContextCell;

export const useColumn = <T>(columnName: string, propertyName?: string, sort?: boolean): IbColumnDef => ({
  columnDef: propertyName ?? columnName,
  header: columnName,
  cell: (e) => e[propertyName ?? columnName],
  sort
});

export const useDateColumn = <T>(
  columnName: string,
  propertyName?: string,
  sort?: boolean,
  format: string = 'dd/MM/yyyy HH:mm z',
  locale: string = 'it'
): IbColumnDef => ({
  columnDef: propertyName ?? columnName,
  header: columnName,
  cell: (e) => `${formatDate(e[propertyName ?? columnName], format, locale)}`,
  sort
});


export const useNumberColumn = <T>(
  columnName: string,
  propertyName?: string,
  sort?: boolean,
  format: string = '1.2-2',
  locale: string = 'it'
): IbColumnDef => ({
  columnDef: propertyName ?? columnName,
  header: columnName,
  cell: (e) => `${formatNumber(e[propertyName ?? columnName], locale, format)}`,
  sort
});

export const useTranslateColumn = <T>(
  columnName: string,
  propertyName?: string,
  sort?: boolean,
  params: any = {},
): IbColumnDef => ({
  component: IbTranslateCell,
  columnDef: propertyName ?? columnName,
  header: columnName,
  cell: (e) => ({ key: e[propertyName ?? columnName], params }),
  sort
});
