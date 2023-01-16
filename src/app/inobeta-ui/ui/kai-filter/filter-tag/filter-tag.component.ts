import { Component, ElementRef, forwardRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { IbFilterBase } from '../filter-base/filter-base';

@Component({
  selector: 'ib-filter-tag',
  templateUrl: './filter-tag.component.html',
  providers: [{provide: IbFilterBase, useExisting: forwardRef(() => IbFilterTag)}]
})

export class IbFilterTag extends IbFilterBase {
  constructor() {
    super();
  }
}
