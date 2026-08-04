import { NgTemplateOutlet } from '@angular/common';
import { Component, input, Input, signal } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { IbColumn } from "../kai-table/columns";
import { IbKaiRowGroupDirective } from "../kai-table/rowgroup";
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'ib-kai-table-mobile-item',
  template: `
<mat-card>
  <div class="ib-kai-table-mobile__grid">
    @for (col of cardDataColumns(); track col.name(); let last = $last; let even = $even) {
      <section
        class="ib-kai-table-mobile__item"
        [class.ib-kai-table-mobile__item--right]="even && !(last && isOdd(cardDataColumns().length))"
        [class.ib-kai-table-mobile__item--full]="last && isOdd(cardDataColumns().length)"
      >
        <div class="ib-kai-table-mobile__label">
          {{ col.headerText() || col.name() }}
        </div>

        <div class="ib-kai-table-mobile__value">
          @if (col.ibCellDef(); as cellDef) {
            <ng-container
              *ngTemplateOutlet="
                 cellDef.templateRef;
                context: { $implicit: row }
              "
            />
          } @else {
            {{ col.mobileDataRenderer(row, col.name()) }}
          }
        </div>
      </section>
    }
  </div>

  @if (cardActionColumns().length) {
    <div class="ib-kai-table-mobile__card-actions">
      @for (col of cardActionColumns(); track col.name() ?? $index) {
        @if (col.ibCellDef(); as cellDef) {
          <ng-container
            *ngTemplateOutlet="
               cellDef.templateRef;
              context: { $implicit: row }
            "
          />
        }
      }
    </div>
  }

  @if (rowGroup(); as group) {
    <button
      type="button"
      class="ib-kai-table-mobile__details-toggle"
      (click)="toggleRowGroup()"
    >
      <span>
        {{ (isExpanded() ? 'shared.ibTable.hideDetails' : 'shared.ibTable.showDetails' )| translate }}
      </span>
      <span
        class="ib-kai-table-mobile__chevron"
        [class.ib-kai-table-mobile__chevron--expanded]="isExpanded()"
      >
        ▾
      </span>
    </button>

    @if (isExpanded()) {
      <div class="ib-kai-table-mobile__details">
        <ng-container
          *ngTemplateOutlet="
            group.templateRef;
            context: { $implicit: row }
          "
        />
      </div>
    }
  }
</mat-card>
  `,
  imports: [
    MatCard, NgTemplateOutlet, TranslatePipe
  ],
  styles: [`

    .ib-kai-table-mobile__card {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      background: var(--ib-mobile-card-bg);
      border: 1px solid var(--ib-mobile-border);
      border-radius: var(--ib-mobile-radius);
      box-shadow: var(--ib-mobile-shadow);
      overflow: hidden;
    }

    .ib-kai-table-mobile__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0;
    }

    .ib-kai-table-mobile__item {
      min-width: 0;
      padding: 12px 14px 10px;
      border-bottom: 1px solid var(--ib-mobile-separator);
    }

    .ib-kai-table-mobile__item--right {
      border-right: 1px solid color-mix(in srgb, var(--ib-mobile-separator) 70%, transparent);
    }

    .ib-kai-table-mobile__item--full {
      grid-column: 1 / -1;
    }

    .ib-kai-table-mobile__label {
      font-size: 11px;
      line-height: 1.2;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--ib-mobile-text-muted);
      margin-bottom: 4px;
    }

    .ib-kai-table-mobile__value {
      min-width: 0;
      color: var(--ib-mobile-text);
      font-size: 15px;
      line-height: 1.3;
      font-weight: 600;
      word-break: break-word;
    }

    .ib-kai-table-mobile__card-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid var(--ib-mobile-separator);
    }

    .ib-kai-table-mobile__details-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border: 0;
      border-top: 1px solid var(--ib-mobile-separator);
      background: transparent;
      color: var(--ib-mobile-text);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .ib-kai-table-mobile__chevron {
      display: inline-block;
      transition: transform 160ms ease;
    }

    .ib-kai-table-mobile__chevron--expanded {
      transform: rotate(180deg);
    }

    .ib-kai-table-mobile__details {
      padding: 12px 14px 14px;
      border-top: 1px solid var(--ib-mobile-separator);
      background: var(--mat-sys-surface-container);
    }


  `]
})
export class IbKaiTableMobileItemComponent {
  @Input() row: any;
  cardDataColumns = input<IbColumn<any>[]>([]);
  cardActionColumns = input<IbColumn<any>[]>([]);
  rowGroup = input<IbKaiRowGroupDirective | null>(null);
  isExpanded = signal(false);


  toggleRowGroup(): void {
    this.isExpanded.update(current => !current);
  }

  isRowGroupExpanded(): boolean {
    return this.isExpanded();
  }

  isOdd(value: number): boolean {
    return value % 2 !== 0;
  }


}
