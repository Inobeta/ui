import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ib-table-search',
  template: `
    <div *ngIf="hasSearch">
      <mat-form-field>
        <input
          matInput
          placeholder="{{ 'shared.ibTable.search' | translate }}"
          [value]="filterValues['generic']"
          (change)="filterChange.emit({
                key: 'generic',
                data: $event
           })"/>
        <i
          class="material-icons hover"
          matSuffix
          style="cursor: pointer;">search
        </i>
      </mat-form-field>
    </div>
  `,
})
export class TableSeachComponent {
  @Input() filterValues: any = {};
  @Input() hasSearch;
  @Output() filterChange = new EventEmitter();
}
