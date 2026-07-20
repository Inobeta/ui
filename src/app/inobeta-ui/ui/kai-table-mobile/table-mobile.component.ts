import {
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { IDataExportSettings } from '../data-export/data-export.service';
import { IbFilter } from '../kai-filter';
import { IbFilterBase } from '../kai-filter/filters/base/filter-base';
import { IbKaiTableAction, } from "../kai-table/action";
import { IbActionColumn } from "../kai-table/columns/action-column";
import { IbColumn } from "../kai-table/columns/column";
import { IbKaiRowGroupDirective } from "../kai-table/rowgroup";
import { IbKaiTableState, IbTableDef } from "../kai-table/table.types";
import { IbKaiTableMobileInfiniteScrollComponent } from './table-mobile-infinitescroll.component';
import { IbKaiTableMobileItemComponent } from './table-mobile-item.component';
import { IbKaiTableMobileToolbarComponent } from './table-mobile-toolbar.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

type IbKaiTableMobileDataSource<T> = DataSource<T> & {
  readonly sortState?: Sort;
  readonly input?: { sort: Sort | null };
};
@Component({
  selector: 'ib-kai-table-mobile',
  standalone: true,
  imports: [IbKaiTableMobileToolbarComponent, IbKaiTableMobileItemComponent, IbKaiTableMobileInfiniteScrollComponent, MatProgressBar, MatIconModule, TranslatePipe],
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
      @if (cardDataColumns().length === 0 && cardActionColumns().length === 0 && state() !== 'loading') {
        <div class="table-empty">
          <mat-icon class="table-empty-icon">inbox</mat-icon>
          <span class="table-empty-label">{{ "common.noItems" | translate }}</span>
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

   .table-empty {
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      min-height: 150px;
      border: 1px solid var(--ib-mobile-border);
      border-radius: 10px;
    }

    .table-empty-icon {
      font-size: 2.25rem;
      width: 2.25rem;
      height: 2.25rem;
    }

    .table-empty-label {
      font-size: 0.875rem;
      color: var(--ib-mobile-text);
    }
  `]
})
export class IbKaiTableMobileComponent implements OnDestroy {
  state = input<IbKaiTableState>('idle');
  dataSource = input<IbKaiTableMobileDataSource<unknown>>();
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
  sortUpdated = output<Sort>()

  visibleCount = signal(this.pageSize());
  filtersOpen = signal(false);

  data = signal<unknown[]>([]);
  datasourceConnection: Subscription | null = null;
  currentSort = signal<Sort | null>(null);

  constructor() {
    effect((onCleanup) => {
      const datasource = this.dataSource();
      this.datasourceConnection?.unsubscribe();
      this.datasourceConnection = null;

      if (!datasource) {
        this.data.set([]);
        this.currentSort.set(null);
        return;
      }

      const sortState = datasource.sortState ?? datasource.input?.sort ?? null;
      this.currentSort.set(sortState?.active ? { ...sortState } : null);
      this.datasourceConnection = datasource
        .connect({} as CollectionViewer)
        .subscribe((rows) => {
          this.data.set([...rows]);
          const current = datasource.sortState ?? datasource.input?.sort ?? null;
          this.currentSort.set(current?.active ? { ...current } : null);
        });
      onCleanup(() => {
        this.datasourceConnection?.unsubscribe();
        this.datasourceConnection = null;
      });
    });
  }

  ngOnDestroy() {
    if (this.datasourceConnection) {
      this.datasourceConnection.unsubscribe();
    }
  }

  sortableColumns = computed(() => {
    const cols = this.columns() ?? [];
    return cols.filter(c => c.sortInput());
  });

  visibleColumns = computed(() => {
    const cols = this.columns() ?? [];
    const displayed = [...(this.displayedColumns() ?? [])]
      if (this.actionColumn() && !displayed.includes('ib-action')) {
      displayed.push('ib-action');
    }

    if (!displayed.length) {
      return cols;
    }

    const byName = new Map(cols.map(col => [col.name(), col]));
    return displayed
      .map(name => byName.get(name))
      .filter((col): col is IbColumn<any> => !!col);
  });

  cardDataColumns = computed(() => {
    return this.visibleColumns().filter(col => !col.isActionColumnInput());
  });

  cardActionColumns = computed(() => {
    return this.visibleColumns().filter(col => col.isActionColumnInput());
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

  sortUpdate(columnName: string): void {
    const currentSort = this.currentSort();
    const direction = currentSort?.active === columnName && currentSort.direction === 'asc'
      ? 'desc'
      : 'asc';
    this.sortUpdated.emit({ active: columnName, direction });
  }
}
