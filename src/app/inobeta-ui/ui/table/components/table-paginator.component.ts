import {Component, EventEmitter, Input, Output} from '@angular/core';
import { IbTablePaginatorState } from '../store/reducers/table.reducer';

@Component({
  selector: 'ib-table-paginator',
  template: `
    <div>
      <mat-paginator
        style="margin-top: 10px;background-color: transparent;"
        [length]="paginatorDef.length"
        [pageSize]="paginatorDef.pageSize"
        [pageSizeOptions]="[5, 10, 25, 100]"
        [showFirstLastButtons]="true"
        [pageIndex]="paginatorDef.pageIndex"
        (page)="pageChangeHandle.emit($event)">
      </mat-paginator>
    </div>
  `,
})
export class IbTablePaginatorComponent {
  @Input() numOfElements;
  @Input() paginationInfo;
  @Input() elemForPage = 0;

  @Input() paginatorDef: IbTablePaginatorState = {
    pageIndex: 0,
    pageSize: 10,
    length: 0
  };
  
  @Output() pageChangeHandle = new EventEmitter();
}
