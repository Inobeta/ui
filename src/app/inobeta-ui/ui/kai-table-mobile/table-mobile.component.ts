import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  input,
  signal
} from '@angular/core';

import { JsonPipe } from '@angular/common';
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
@Component({
  selector: 'ib-kai-table-mobile',
  standalone: true,
  imports: [IbKaiTableMobileToolbarComponent, IbKaiTableMobileItemComponent, IbKaiTableMobileInfiniteScrollComponent, JsonPipe],
  template: `
    <div class="ib-kai-table-mobile">
      @if (headerActions().length || filters().length) {
        <!-- TBD <div class="ib-kai-table-mobile__sticky-header">
          <ib-kai-table-mobile-toolbar
            [headerActions]="headerActions()"
            [filters]="filters()"
          ></ib-kai-table-mobile-toolbar>
        </div>-->
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
export class IbKaiTableMobileComponent {
  state = input<IbKaiTableState>('idle');
  data = input<any[]>([]);
  dataSource = input<IbTableDataSource<any>>(new IbTableDataSource([]));
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

  @ViewChild('scrollAnchor') scrollAnchor?: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;
  visibleCount = signal(this.pageSize());
  filtersOpen = signal(false);

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
}
