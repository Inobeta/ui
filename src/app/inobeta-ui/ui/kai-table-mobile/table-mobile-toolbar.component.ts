import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCard } from "@angular/material/card";
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';
import { IbDataExportService, IDataExportSettings } from '../data-export/data-export.service';
import { IbFilterBase } from '../kai-filter/filters/base/filter-base';
import { IbKaiTableAction, } from "../kai-table/action";

@Component({
  selector: 'ib-kai-table-mobile-toolbar',
  standalone: true,
  imports: [NgTemplateOutlet, MatCard, MatButtonModule, MatIcon, MatTooltipModule],
  template: `
          <div class="ib-kai-table-mobile__toolbar">
            <mat-card>
            <div class="ib-kai-table-mobile__toolbar-actions">
              @for (action of headerActions(); track $index) {
                @if(action.kind() === 'export') {
                  <button
                    mat-icon-button
                    [matTooltip]="'shared.ibTable.export' "
                    (click)="openExportDialog()"
                  >
                    <mat-icon>file_download</mat-icon>
                  </button>
                  <!--<ib-table-data-export-action
                    [showSelectedRowsOption]="false"
                    [showAllRowsOption]="true"
                    />-->
                } @else {
                  <ng-container *ngTemplateOutlet="action.templateRef"> </ng-container>
                }
              }
            </div>
            </mat-card>
            <!--@if (filters().length) {
              <mat-card>
                <button
                  type="button"
                  class="ib-kai-table-mobile__filter-button"
                  (click)="toggleFilters()"
                >
                  Filtri
                  @if (activeFiltersCount() > 0) {
                    <span class="ib-kai-table-mobile__filter-badge">
                      {{ activeFiltersCount() }}
                    </span>
                  }
                </button>
              </mat-card>
            }-->
          </div>

          @if (filtersOpen()) {
            <mat-card>
              <div class="ib-kai-table-mobile__filters-panel-header">
                <div class="ib-kai-table-mobile__filters-title">Filtri</div>

                <div class="ib-kai-table-mobile__filters-panel-actions">
                  <button
                    type="button"
                    class="ib-kai-table-mobile__filters-action"
                    (click)="clearAllFilters()"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    class="ib-kai-table-mobile__filters-action"
                    (click)="closeFilters()"
                  >
                    Chiudi
                  </button>
                </div>
              </div>

              <div class="ib-kai-table-mobile__filters-content">
                @for (f of filters(); track f.name) {
                  <div class="ib-kai-table-mobile__filter-item">
                    <div class="ib-kai-table-mobile__filter-item-main">
                      <div class="ib-kai-table-mobile__filter-item-label">
                        {{ f.mobileLabel() }}
                      </div>

                      <div class="ib-kai-table-mobile__filter-item-value">
                        {{ f.mobileSummary() || 'Nessun filtro attivo' }}
                      </div>
                    </div>

                    <div class="ib-kai-table-mobile__filter-item-actions">
                      @if (f.mobileHasValue()) {
                        <button
                          type="button"
                          class="ib-kai-table-mobile__filter-item-button"
                          (click)="f.clear()"
                        >
                          Reset
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
              </mat-card>
          }


  `,
  styles: [`
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
      justify-content: space-between;
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
      flex-direction: column;
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
export class IbKaiTableMobileToolbarComponent {
  headerActions = input<readonly IbKaiTableAction[]>([]);
  filters = input<readonly IbFilterBase[]>([]);
  doExport = output<Partial<IDataExportSettings>>()
  filtersOpen = signal(false);
  exportService: IbDataExportService = inject(IbDataExportService);

  activeFiltersCount = computed(() => {
    return this.filters().filter(f => f.mobileHasValue()).length;
  });


  toggleFilters(): void {
    this.filtersOpen.update(v => !v);
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

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
