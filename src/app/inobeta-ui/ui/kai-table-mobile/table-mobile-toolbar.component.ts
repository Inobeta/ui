import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal
} from '@angular/core';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from "@angular/material/card";
import { MatIcon } from '@angular/material/icon';
import { Sort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, Subscription } from 'rxjs';
import { IbDataExportService, IDataExportSettings } from '../data-export/data-export.service';
import { IbFilterBase } from '../kai-filter/filters/base/filter-base';
import { IbKaiTableAction, } from "../kai-table/action";
import { IbColumn } from '../kai-table/columns/column';

@Component({
  selector: 'ib-kai-table-mobile-toolbar',
  standalone: true,
  imports: [NgTemplateOutlet, MatCard, MatButtonModule, MatIcon, MatTooltipModule, MatBadgeModule],
  template: `
    <div class="ib-kai-table-mobile__toolbar-container">
          <div class="ib-kai-table-mobile__toolbar">
            <mat-card>
            <div class="ib-kai-table-mobile__toolbar-actions">

              @if(sortableColumns().length > 0) {
                <button
                  mat-icon-button
                  (click)="sortOpen.set(!sortOpen())"
                >
                  <mat-icon>sort</mat-icon>
                </button>
              }

            @if (filters().length) {
                <button
                  mat-icon-button
                  (click)="filtersOpen.set(!filtersOpen())"
                  [matBadge]="activeFiltersCount()"
                  [matBadgeHidden]="activeFiltersCount() === 0"
                >
                  <mat-icon>filter_alt</mat-icon>
                </button>
            }
              @for (action of headerActions(); track $index) {
                @if(action.kind() === 'export') {
                  <button
                    mat-icon-button
                    [matTooltip]="'shared.ibTable.export' "
                    (click)="openExportDialog()"
                  >
                    <mat-icon>file_download</mat-icon>
                  </button>
                } @else {
                    <ng-container *ngTemplateOutlet="action.templateRef()"> </ng-container>
                }
              }
            </div>
            </mat-card>
          </div>

          @if (sortOpen()) {
            <mat-card>
              <div style="display: flex; flex-direction: column;">
                @for (col of sortableColumns(); track $index) {
                    <button
                      mat-button
                      style="justify-content: flex-start;"
                      (click)="sortUpdated.emit(col.name())"
                    >
                       {{ col.headerText()  }}
                       @if (currentSort()?.active === col.name()) {
                        <mat-icon>
                          {{ currentSort()?.direction === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                        </mat-icon>
                      }
                    </button>
                }
              </div>
            </mat-card>
           }

          @if (filtersOpen()) {
            <mat-card>
              <div class="ib-kai-table-mobile__filters-panel-header">

                <div class="ib-kai-table-mobile__filters-panel-actions">
                  <button
                    type="button"
                    class="ib-kai-table-mobile__filters-action"
                    (click)="clearAllFilters()"
                  >
                    <mat-icon>restore</mat-icon>
                  </button>

                  <button
                    type="button"
                    class="ib-kai-table-mobile__filters-action"
                    (click)="filtersOpen.set(false)"
                  >
                    <mat-icon>keyboard_arrow_up</mat-icon>
                  </button>
                </div>
              </div>

              <div class="ib-kai-table-mobile__filters-content">
                @for (f of filters(); track f.name) {
                  @if(f.mobileLabel()){
                    <div class="ib-kai-table-mobile__filter-item-label">
                      {{ f.mobileLabel() }}
                    </div>
                  }
                  <ng-container
                    *ngTemplateOutlet="f.getMobileTemplate()">
                  </ng-container>
                }
              </div>
              </mat-card>
          }
        </div>

  `,
  styles: [`
    .ib-kai-table-mobile__toolbar-container{
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ib-kai-table-mobile__toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 10px 12px;
      border: 1px solid var(--ib-mobile-border);
      border-radius: 16px;
      background: var(--ib-mobile-card-bg);
      box-shadow: var(--ib-mobile-shadow);
    }

    .ib-kai-table-mobile__toolbar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .ib-kai-table-mobile__filter-button,
    .ib-kai-table-mobile__filters-action,
    .ib-kai-table-mobile__filter-item-button {
      border: 1px solid var(--ib-mobile-border);
      background: var(--mat-sys-surface-container-high);
      color: var(--ib-mobile-text);
      border-radius: 999px;
      padding: 8px 12px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .ib-kai-table-mobile__filter-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      margin-left: 6px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font-size: 11px;
      line-height: 1;
    }

    .ib-kai-table-mobile__filters-panel {
      margin-top: 10px;
      border: 1px solid var(--ib-mobile-border);
      border-radius: 16px;
      background: var(--ib-mobile-card-bg);
      box-shadow: var(--ib-mobile-shadow);
      overflow: hidden;
    }

    .ib-kai-table-mobile__filters-panel-header {
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid var(--ib-mobile-separator);
    }

    .ib-kai-table-mobile__filters-title {
      font-weight: 700;
      color: var(--ib-mobile-text);
    }

    .ib-kai-table-mobile__filters-panel-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ib-kai-table-mobile__filters-content {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
      padding: 12px;
    }

    .ib-kai-table-mobile__filter-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--ib-mobile-separator);
      border-radius: 12px;
      background: var(--mat-sys-surface-container);
    }

    .ib-kai-table-mobile__filter-item-main {
      min-width: 0;
    }

    .ib-kai-table-mobile__filter-item-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--ib-mobile-text);
      margin-bottom: 4px;
    }

    .ib-kai-table-mobile__filter-item-value {
      font-size: 13px;
      color: var(--ib-mobile-text-muted);
      word-break: break-word;
    }
  `]
})
export class IbKaiTableMobileToolbarComponent implements OnDestroy {
  headerActions = input<readonly IbKaiTableAction[]>([]);
  filters = input<readonly IbFilterBase[]>([]);
  sortableColumns = input<readonly IbColumn<any>[]>([]);
  currentSort = input<Sort | null>(null);
  doExport = output<Partial<IDataExportSettings>>()
  sortUpdated = output<string>()
  filtersOpen = signal(false);
  sortOpen = signal(false);

  exportService: IbDataExportService = inject(IbDataExportService);

  filterSubscriptions = new Map<string, Subscription>();
  filterStates = signal<Record<string, boolean>>({});

  constructor() {
    effect(() => {
      for (const subscription of this.filterSubscriptions.values()) {
        subscription.unsubscribe();
      }
      for (const f of this.filters()) {
        const subscription = f.filter.ibFilterUpdated.subscribe((v) => {
          this.filterStates.update(states => ({
            ...states,
            [f.name]: f.mobileHasValue()
          }));
        });
        this.filterSubscriptions.set(f.name, subscription);
      }
    })
  }

  ngOnDestroy(): void {
    for (const subscription of this.filterSubscriptions.values()) {
      subscription.unsubscribe();
    }
  }

  activeFiltersCount = computed(() => {
    return Object.values(this.filterStates()).filter(f => f).length;
  });


  clearAllFilters(): void {
    this.filters().forEach(f => f.clear());
  }

  openExportDialog() {
    this.exportService
      .openExportDialog({
        showSelectedRowsOption: false,
        showAllRowsOption: true,
      })
      .pipe(filter((settings) => !!settings))
      .subscribe((settings) => this.doExport.emit(settings));
  }
}
