import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ib-table-paginator',
  template: `
    <div>
      <mat-paginator
        style="margin-top: 10px;background-color: transparent;"
        [length]="numOfElements"
        [pageSize]="(!reduced) ? 10 : numOfElements"
        [pageSizeOptions]="[5, 10, 25, 100]"
        [showFirstLastButtons]="true"
        [pageIndex]="paginationInfo.pageIndex"
        (page)="pageChangeHandle.emit($event)">
      </mat-paginator>
    </div>
  `,
})
export class TablePaginatorComponent {
  @Input() numOfElements;
  @Input() reduced;
  @Input() paginationInfo;
  @Output() pageChangeHandle = new EventEmitter();
}
