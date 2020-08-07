import { Component, OnInit, Input, EventEmitter, Output, HostListener } from '@angular/core';
import { TableTitles } from '../../titles.model';
import { TemplateModel } from '../../template.model';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[ib-table-header]',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.css']
})
export class TableHeaderComponent implements OnInit {
  @Input() table: any;
  @Input() titles: TableTitles[] = [];
  @Input() selectableRows = true;
  @Input() selectRowName = 'Seleziona';
  @Input() currentSort: any = {};
  @Input() templateHeaders: any = {};
  @Input() templateButtons: TemplateModel[] = [];
  @Input() columnFilter = {};
  visibleHeaders = {};

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
