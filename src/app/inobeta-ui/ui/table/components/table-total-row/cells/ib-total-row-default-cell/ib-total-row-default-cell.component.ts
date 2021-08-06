import { Component, ComponentFactoryResolver, ComponentRef, Directive, Input, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IbTableItem } from '../../../../models/table-item.model';
import { IbTableTitles, IbTableTitlesTypes } from '../../../../models/titles.model';
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
export class IbTotalRowDefaultCellComponent {
  @Input() title: IbTableTitles;
  @Input() sortedData: IbTableItem[];
  @Input() filteredData: IbTableItem[];
  
  @ViewChild(IbTableTotalRowCellDirective, { static: true }) cellHost: IbTableTotalRowCellDirective;

  private componentRef: ComponentRef<IbTotalRowBaseCellComponent>;

  constructor(public dialog: MatDialog, private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    if (this.title.type === IbTableTitlesTypes.NUMBER) {
      this.loadComponent(IbTotalRowAddCellComponent);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const sortedDataChanges = changes['sortedData'];
    const shouldChange = this.componentRef && !sortedDataChanges.isFirstChange()
    if (shouldChange) {
      this.componentRef.instance.data = {
        ...this.componentRef.instance.data,
        sortedData: this.sortedData,
        filteredData: this.filteredData
      };
    }
  }

  loadComponent(component: Type<any>) {
    const item = new TotalRowCellItem(component, {
      title: this.title,
      sortedData: this.sortedData,
      filteredData: this.filteredData,
    })
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);
    const viewContainerRef = this.cellHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent<any>(componentFactory);
    this.componentRef.instance.data = item.data;
    this.componentRef.instance.addCell.subscribe(this.handleAddCell.bind(this));
  }

  openDialog() {
    const dialog = this.dialog.open(IbTableTotalRowApplyDialogComponent, { width: '380px' });
    dialog.afterClosed().subscribe(this.handleDialogClosed.bind(this));
  }

  private handleAddCell() {
    this.openDialog();
  }

  private handleDialogClosed(result: any) {
    if (!result) {
      return;
    }
    this.loadComponent(result.component);
  }
}

export class TotalRowCellItem {
  constructor(public component: Type<any>, public data: any) {}
}