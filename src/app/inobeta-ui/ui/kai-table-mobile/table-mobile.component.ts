import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { IDataExportSettings } from '../data-export/data-export.service';
import { IbFilter } from '../kai-filter';
import { IbFilterBase } from '../kai-filter/filters/base/filter-base';
import { IbKaiTableAction, } from "../kai-table/action";
import { IbActionColumn } from "../kai-table/columns/action-column";
import { IbColumn } from "../kai-table/columns/column";
import { IbKaiRowGroupDirective } from "../kai-table/rowgroup";
import { IbTableDataSource } from '../kai-table/table-data-source';
import { IbKaiTableState, IbTableDef } from "../kai-table/table.types";
import { IbKaiTableMobileInfiniteScrollComponent } from './table-mobile-infinitescroll.component';
import { IbKaiTableMobileItemComponent } from './table-mobile-item.component';
import { IbKaiTableMobileToolbarComponent } from './table-mobile-toolbar.component';
import { MatProgressBar } from '@angular/material/progress-bar';
@Component({
  selector: 'ib-kai-table-mobile',
  standalone: true,
  imports: [IbKaiTableMobileToolbarComponent, IbKaiTableMobileItemComponent, IbKaiTableMobileInfiniteScrollComponent, MatProgressBar],
  template: `
    <div class="ib-kai-table-mobile">
      @if (headerActions().length > 0 || filters().length > 0) {
        <div class="ib-kai-table-mobile__sticky-header">
          <ib-kai-table-mobile-toolbar
            [headerActions]="headerActions()"
            [filters]="filters()"
            [sortableColumns]="sortableColumns()"
            [currentSort]="currentSort()"
            (doExport)="doExport.emit($event)"
            (sortUpdated)="sortUpdate($event)"
          ></ib-kai-table-mobile-toolbar>
        </div>
      }
      @if (state() === 'loading') {
        <div class="ib-table__content__progress-bar">
          <mat-progress-bar mode="indeterminate" />
        </div>
      }
      @if (cardDataColumns().length || cardActionColumns().length) {
        <div class="ib-kai-table-mobile__content">
          @for (row of visibleRows(); track trackRow($index, row)) {
            <ib-kai-table-mobile-item
              [row]="row"
              [cardDataColumns]="cardDataColumns()"
              [cardActionColumns]="cardActionColumns()"
              [rowGroup]="rowGroup()"
              ></ib-kai-table-mobile-item>
          }

          @if (hasMoreRows()) {
            <ib-kai-table-mobile-infinitescroll
              [hasMoreRows]="hasMoreRows()"
              [data]="data()"
              (visibleCountChanged)="visibleCount.set($event)"
            ></ib-kai-table-mobile-infinitescroll>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-width: 0;

      --ib-mobile-bg: var(--mat-sys-surface);
      --ib-mobile-card-bg: var(--mat-sys-surface-container-low);
      --ib-mobile-border: var(--mat-sys-outline-variant);
      --ib-mobile-separator: var(--mat-sys-outline-variant);
      --ib-mobile-text: var(--mat-sys-on-surface);
      --ib-mobile-text-muted: var(--mat-sys-on-surface-variant);
      --ib-mobile-shadow: var(--mat-sys-level1);
      --ib-mobile-radius: 18px;
      --ib-mobile-sticky-top: 0px;
    }

    .ib-kai-table-mobile {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      background: var(--ib-mobile-bg);
    }

    .ib-kai-table-mobile__sticky-header {
      position: sticky;
      top: var(--ib-mobile-sticky-top);
      z-index: 20;
      background: var(--ib-mobile-bg);
      padding: 12px 12px 8px;
      backdrop-filter: blur(4px);
    }


    .ib-kai-table-mobile__content {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 4px 12px 12px;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }
  `]
})
export class IbKaiTableMobileComponent implements OnDestroy {
  state = input<IbKaiTableState>('idle');
  dataSource = input<IbTableDataSource<any>>();
  tableName = input<string>(btoa(window.location.pathname + window.location.hash));
  tableDef = input<Partial<IbTableDef>>({});
  displayedColumns = input<string[]>([]);
  pageSize = input(20);

  columns = input<readonly IbColumn<any>[]>();
  rowGroup = input<IbKaiRowGroupDirective>();
  filter = input<IbFilter>();
  filters = input<readonly IbFilterBase[]>();
  headerActions = input<readonly IbKaiTableAction[]>();
  actionColumn = input<IbActionColumn>();

  doExport = output<Partial<IDataExportSettings>>()
  sortUpdated = output<MatSort>()

  @ViewChild('scrollAnchor') scrollAnchor?: ElementRef<HTMLElement>;

  visibleCount = signal(this.pageSize());
  filtersOpen = signal(false);

  data = signal<any[]>([]);
  datasourceConnection: Subscription | null = null;
  currentSort = signal<{ active: string, direction: 'asc' | 'desc' } | null>(null);

  constructor() {
    effect(() => {
      const datasource = this.dataSource();
      if (datasource) {
        if (this.datasourceConnection) this.datasourceConnection.unsubscribe()
        this.datasourceConnection = datasource.connect().asObservable().subscribe(data => {
          this.data.set(data);
          this.currentSort.set(datasource.sort ? { active: datasource.sort.active, direction: datasource.sort.direction as 'asc' | 'desc' } : null);
        }
        )
      }
    })
  }

  ngOnDestroy() {
    if (this.datasourceConnection) {
      this.datasourceConnection.unsubscribe();
    }
  }

  sortableColumns = computed(() => {
    const cols = this.columns() ?? [];
    return cols.filter(c => c.sort);
  });

  visibleColumns = computed(() => {
    const cols = this.columns() ?? [];
    const displayed = [...(this.displayedColumns() ?? [])]
    if (!!this.actionColumn && !displayed.includes('ib-action')) {
      displayed.push('ib-action');
    }

    if (!displayed.length) {
      return cols;
    }

    const byName = new Map(cols.map(col => [col.name, col]));
    return displayed
      .map(name => byName.get(name))
      .filter((col): col is IbColumn<any> => !!col);
  });

  cardDataColumns = computed(() => {
    return this.visibleColumns().filter(col => !col.isActionColumn);
  });

  cardActionColumns = computed(() => {
    return this.visibleColumns().filter(col => col.isActionColumn);
  });

  visibleRows = computed(() => {
    return (this.data() ?? []).slice(0, this.visibleCount());
  });

  hasMoreRows = computed(() => {
    return this.visibleRows().length < (this.data()?.length ?? 0);
  });


  trackRow(index: number, row: any): unknown {
    return this.getRowKey(row, index);
  }


  private getRowKey(row: any, index: number): unknown {
    return row?.id ?? row?.uuid ?? row?.key ?? index;
  }

  sortUpdate(columnName: string) {
    const currentSort = this.dataSource().sort;
    if (currentSort.active === columnName) {
      const newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
      const newSort: MatSort = new MatSort();
      newSort.active = columnName;
      newSort.direction = newDirection;
      this.sortUpdated.emit(newSort);
      return;
    }
    const newSort: MatSort = new MatSort();
    newSort.active = columnName;
    newSort.direction = 'asc';
    this.sortUpdated.emit(newSort);
  }
}
