import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {TableTitles, TableTitlesTypes} from '../titles.model';
import {SortableColumn} from './sortableColumn.model';
import {JsonFormatterService} from '../../../utils/jsonFormatter.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'ib-table-prime',
  template: `
    <p-table #table [value]="items" [columns]="titles"
             [paginator]="paginator" [rows]="rowsPerPage"
             selectionMode="single" (onRowSelect)="selectItem($event.data)"
             (onFilter)="filter($event)" [filters]="filterValues"
             (onSort)="sort($event)" [sortField]="currentSort.field" [sortOrder]="currentSort.order">
      <ng-template pTemplate="header" let-columns>
        <tr id="tableHeaders">
          <th *ngFor="let col of columns" [pSortableColumn]="col.key">
            {{col.value | translate}}
            <p-sortIcon [field]="col.key"></p-sortIcon>
          </th>
        </tr>
        <tr [formGroup]="filtersForm">
          <th *ngFor="let col of columns">
            <span *ngIf="col.type === typeEnum.ANY || col.type === typeEnum.BUTTON">
            <input style="width: 100%;" [formControlName]="col.key"
                   pInputText type="text" (input)="table.filter($event.target.value, col.key, 'contains')">
            </span>
            <span *ngIf="col.type === typeEnum.COMBOBOX">
              <p-dropdown [formControlName]="col.key" [autoWidth]="false" [style]="{'width':'100%'}" [options]="col.comboOptions"
                          (onChange)="comboFilter(table, $event.value, col, 'equals')"></p-dropdown>
            </span>
            <span *ngIf="col.type === typeEnum.DATE">
                <p-dropdown [formControlName]="col.key + 'MatchMode'" [autoWidth]="false" [style]="{'width':'50%'}" [options]="dateMatchModes"
                          (onChange)="comboDateRangeFilter(table, $event.value, col)"></p-dropdown>
                <p-calendar [inputStyle]="{'width':'100%'}"
                            [formControlName]="col.key"
                            (onSelect)="dateFilter(table, $event, col)"
                            dateFormat="dd/mm/yy"></p-calendar>
            </span>
          </th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr [pSelectableRow]="rowData" class="tableRow">
          <td *ngFor="let col of columns" style="overflow: hidden; text-overflow: ellipsis;">
            <span id="table" *ngIf="col.type === typeEnum.ANY">
              {{rowData[col.key]}}
            </span>
            <span *ngIf="col.type === typeEnum.COMBOBOX">
              {{comboOptionsObject[col.key][rowData[col.key]]}}
            </span>
            <span *ngIf="col.type === typeEnum.DATE">
              {{rowData[col.key] | date: 'dd/MM/yyyy' }}
            </span>
            <span *ngIf="col.type === typeEnum.BUTTON">
              <button class="tableButton" style="width: 100%" pButton label="{{col.key | translate}}" (click)="handleButtonClick(rowData)"></button>
            </span>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `
})

export class TablePrimeComponent implements OnChanges {

  @Input() titles: TableTitles[] = [];
  @Input() items: any[] = [];
  @Input() filterValues: any = {};
  @Input() currentSort: SortableColumn = new SortableColumn();
  @Input() paginator = true;
  @Input() rowsPerPage = 10;

  @Output() onItemSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onButtonClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDateSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onFilterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDateMatchModeSelect: EventEmitter<any> = new EventEmitter<any>();

  filtersForm: FormGroup;
  typeEnum = TableTitlesTypes;
  comboOptionsObject: any = {};

  dateMatchModes = [
    { label: '>=', value: 'gte'},
    { label: '<=', value: 'lte'},
    { label: '=', value: 'equals'},
  ];

  constructor(private jsonFormatter: JsonFormatterService, private fb: FormBuilder) {
  }

  comboFilter(table, eventValue, column, filterMode) {
    table.filter(eventValue, column.key, filterMode);
  }

  dateFilter(table, date, column) {
    table.filter(date, column.key, this.filtersForm.controls[column.key + 'MatchMode'].value);
    this.selectDate(date);
  }

  comboDateRangeFilter(table, dateMatchMode, column) {
    this.onDateMatchModeSelect.emit(dateMatchMode);
    table.filter(this.filtersForm.controls[column.key].value, column.key, dateMatchMode);
  }

  selectItem(item) {
    this.onItemSelect.emit(item);
  }

  selectDate(date) {
    this.onDateSelect.emit(date);
  }

  sort(data) {
    this.onSortChange.emit(data);
  }

  filter(data) {
    this.onFilterChange.emit(data);
  }

  handleButtonClick(data) {
    this.onButtonClick.emit(data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    let filterValues = (changes.filterValues && changes.filterValues.currentValue) ? changes.filterValues.currentValue : this.filterValues;
    let titles = (changes.titles && changes.titles.currentValue) ? changes.titles.currentValue : this.titles;
    let controls = {};
    titles.forEach(title => {
      if (!filterValues[title.key]) {
        controls[title.key] = new FormControl();
        if (title.type === TableTitlesTypes.DATE) {
          controls[title.key + 'MatchMode'] = new FormControl('gte');
        }
      } else {
        controls[title.key] = new FormControl(filterValues[title.key].value);
        if (title.type === TableTitlesTypes.DATE) {
          controls[title.key + 'MatchMode'] = new FormControl(filterValues[title.key]['matchMode']);
        }
      }
    });

    this.filtersForm = this.fb.group(controls);

    if (changes.titles && changes.titles.currentValue) {
      this.titles = changes.titles.currentValue;
      this.titles.forEach(title => {
        if (title.comboOptions) {
          this.comboOptionsObject[title.key] = this.jsonFormatter.formatArrayToJson(title.comboOptions);
        }
      });
    }
  }
}
