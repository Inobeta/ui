import { Component, EventEmitter, HostBinding, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { contains, eq, gt, lt } from '../filters';

@Component({
  selector: 'ib-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['filter-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class IbFilterList implements OnInit {
  @Input() availableFilters: string[];
  @Output() ibUpdateFilter = new EventEmitter<any>();

  @HostBinding('class')
  get class() {
    return ['ib-filter-list'];
  }

  portals: Record<string, any> = {};
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

  constructor(
    private fb: FormBuilder) {}

  ngOnInit() {
    const controls = this.availableFilters.reduce((acc, cur) => ({ ...acc, [cur]: this.fb.group({ condition: [], value: [] }) }), {});
    this.filterForm = this.fb.group(controls);
    this.filterForm.valueChanges.subscribe((rawFilter) => {
      const filter = {};
      for (const [key, value] of Object.entries<any>(rawFilter)) {
        if (!key || !value.condition || !value.value) {
          continue;
        }
        filter[key] = value.condition(value.value);
      }
      this.ibUpdateFilter.emit(filter);
    });

  }

  ngAfterContentInit() {
  }

  getPortal(columnName: string) {
  }

  addActiveFilter(c) {
    this.activeFilters.push(c);
  }
}
