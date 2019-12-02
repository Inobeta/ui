import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ib-table-paginator',
  template: `
    <div *ngIf="hasPaginator">
      <mat-paginator
        style="margin-top: 10px;background-color: transparent;"
        [length]="items.length"
        [pageSize]="(!reduced) ? 10 : items.length"
        [pageSizeOptions]="[5, 10, 25, 100]"
        [showFirstLastButtons]="true"
        (page)="pageChangeHandle.emit($event)">
      </mat-paginator>
    </div>
  `,
})
export class TablePaginatorComponent {
  @Input() hasPaginator;
  @Input() items;
  @Input() reduced;
  @Output() pageChangeHandle = new EventEmitter();
}
