import { Component, ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IbTableItem } from '../../../../models/table-item.model';
import { IbTableTitles, IbTableTitlesTypes } from '../../../../models/titles.model';
import { ibTableActionSetTotalRowCell } from '../../../../store/actions/table.actions';
import { IbTableTotalRowApplyDialogComponent } from '../../table-total-row-apply-dialog.component';
import { IbTotalRowAddCellComponent } from '../ib-total-row-add-cell/ib-total-row-add-cell.component';
import { IbTotalRowBaseCellComponent } from '../ib-total-row-base-cell/ib-total-row-base-cell.component';

@Directive({
  selector: '[cellHost]',
})
export class IbTableTotalRowCellDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

export interface TotalRowCell {
  data: any;
}

@Component({
  selector: '[ib-total-row-default-cell]',
  template: '<ng-template cellHost></ng-template>'
})
export class IbTotalRowDefaultCellComponent implements OnInit, OnChanges {
  @Input() title: IbTableTitles;
  @Input() sortedData: IbTableItem[];
  @Input() filteredData: IbTableItem[];
  @Input() initialCell: Type<any>;
  @Input() tableName: string;

  @ViewChild(IbTableTotalRowCellDirective, { static: true }) cellHost: IbTableTotalRowCellDirective;

  private componentRef: ComponentRef<IbTotalRowBaseCellComponent>;

  constructor(
    public dialog: MatDialog,
    private store: Store,
    private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    if (this.initialCell) {
      return this.loadComponent(this.initialCell);
    }

    if (this.title.type === IbTableTitlesTypes.NUMBER) {
      this.loadComponent(IbTotalRowAddCellComponent);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const initialCellChanges = changes.initialCell;
    const sortedDataChanges = changes.sortedData;

    const shouldChange = this.componentRef && initialCellChanges && !initialCellChanges.isFirstChange();
    if (shouldChange) {
      this.loadComponent(this.initialCell);
    }

    if (sortedDataChanges && !sortedDataChanges.isFirstChange() && this.componentRef) {
      this.componentRef.instance.data = {
        ...this.componentRef.instance.data,
        sortedData: this.sortedData,
        filteredData: this.filteredData
      };
    }
  }

  loadComponent(component: Type<any>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const viewContainerRef = this.cellHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent<any>(componentFactory);
    this.componentRef.instance.data = {
      title: this.title,
      sortedData: this.sortedData,
      filteredData: this.filteredData,
    };
    this.componentRef.instance.addCell.subscribe(this.handleAddCell.bind(this));
  }

  openDialog() {
    const dialog = this.dialog.open(IbTableTotalRowApplyDialogComponent, {
      width: '380px',
      data: { isSet: Boolean(this.initialCell) }
    });
    dialog.afterClosed().subscribe(this.handleDialogClosed.bind(this));
  }

  private handleAddCell() {
    this.openDialog();
  }

  private handleDialogClosed(result: any) {
    if (!result) {
      return;
    }
    console.log('result', result);
    // this.loadComponent(result.component);
    this.store.dispatch(ibTableActionSetTotalRowCell({
      state: {
        columnName: this.title.key,
        func: result.func
      },
      tableName: this.tableName
    }));
  }
}
