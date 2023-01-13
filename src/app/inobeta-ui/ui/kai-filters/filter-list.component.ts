import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { contains, eq, gt, lt } from './filters';

@Component({
  selector: 'ib-filter-list',
  template: `
  <mat-chip-listbox>
      <mat-chip [matMenuTriggerFor]="menu" *ngFor="let af of activeFilters" style="font-size: 13px">
        {{af}}
        <mat-icon matChipTrailingIcon>arrow_drop_down</mat-icon>
        <mat-menu #menu="matMenu">
        <form [formGroup]="filterForm" (click)="$event.stopPropagation()" style="padding: 1em 0; display:flex; flex-direction: column; place-items: start center">
          <section [formGroupName]="af">
            <mat-form-field appearance="fill">
              <mat-label>Condizione</mat-label>
              <mat-select formControlName="condition">
                <mat-option *ngFor="let option of functionOptions" [value]="option.value">
                  {{option.displayValue}}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Valore</mat-label>
              <input matInput formControlName="value">
            </mat-form-field>
          </section>
        </form>
      </mat-menu>
      </mat-chip>
      <mat-chip [matMenuTriggerFor]="addColumnFilter" class="ib-add-column-filter-button" style="font-size: 13px; padding-left: 0">
        <mat-icon matChipTrailingIcon>add</mat-icon>
      </mat-chip>
      <mat-menu #addColumnFilter="matMenu">
        <button mat-menu-item *ngFor="let c of availableFilters" (click)="addActiveFilter(c)">{{c}}</button>
      </mat-menu>
    </mat-chip-listbox>
  `,
  styles: [`
  .ib-add-column-filter-button ::ng-deep .mdc-evolution-chip__cell--primary .mdc-evolution-chip__action {
  padding-left: 0;
}`]
})

export class IbFilterList implements OnInit {
  @Input() availableFilters: string[];
  @Output() ibUpdateFilter = new EventEmitter<any>();

  filterForm: FormGroup;
  activeFilters = [];
  functionOptions = [
    {
      value: eq,
      displayValue: 'Uguale a'
    },
    {
      value: contains,
      displayValue: 'Contiene'
    },
    {
      value: lt,
      displayValue: 'Minore di'
    },
    {
      value: gt,
      displayValue: 'Maggiore di'
    }
  ]

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    const controls = this.availableFilters.reduce((acc, cur) => ({ ...acc, [cur]: this.fb.group({ condition: [], value: [] }) }), {});
    this.filterForm = this.fb.group(controls);
    this.filterForm.valueChanges.subscribe((rawFilter) => {
      const filter = {};
      for (const [key, value] of Object.entries<any>(rawFilter)) {
        if (!key || !value.condition || !value.value) {
          continue;
        }
        console.log(key, value)
        filter[key] = value.condition(value.value);
      }
      console.log(filter)
      this.ibUpdateFilter.emit(filter);
    });
  }

  addActiveFilter(c) {
    this.activeFilters.push(c);
  }
}