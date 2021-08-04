import { Component, OnInit, Input, EventEmitter, Output, HostListener } from '@angular/core';
import { ibTableSupportedFilters, IbTableTitles, IbTableTitlesTypes } from '../../models/titles.model';
import { IbTemplateModel } from '../../models/template.model';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[ib-table-header]',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.css']
})
export class IbTableHeaderComponent implements OnInit {
  @Input() table: any;
  @Input() titles: IbTableTitles[] = [];
  @Input() selectableRows = true;
  @Input() currentSort: any = {};
  @Input() templateHeaders: any = {};
  @Input() templateButtons: IbTemplateModel[] = [];
  @Input() columnFilter = {};
  @Input() hasEdit = false;
  @Input() hasDelete = false;
  @Input() stickyAreas = [];

  renderContextMenu = {};
  visibleHeaders = {};
  columnTypes = IbTableTitlesTypes;
  supportedFilters = ibTableSupportedFilters;

  @Output() handleSetFilter = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  resetCustomHeaderVisibility(event = null) {
    if (event) {
      event.stopPropagation();
    }
    this.visibleHeaders = {};
  }

  setFilter(key, value, indexToSet = 0) {
    this.handleSetFilter.emit({
      key,
      value,
      indexToSet
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    // tslint:disable-next-line: forin
    for (const el in this.visibleHeaders) {
      event.stopPropagation();
      break;
    }
    this.resetCustomHeaderVisibility();
  }

  hasCustomHeadersVisible() {
    return Object.keys(this.visibleHeaders).length > 0;
  }
}
