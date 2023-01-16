import { Component, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'ib-filter-base',
  template: `im based`
})
export class IbFilterBase {
  @Input() ibTableColumnName: string;
  constructor() {}
}
