import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { IbMainMenuDataSet } from '../../models/main-menu-data-set.model';

@Component({
  selector: 'ib-main-menu-expanded',
  templateUrl: './main-menu-expanded.component.html',
  styleUrls: ['./main-menu-expanded.component.css']
})
export class IbMainMenuExpandedComponent {
  @Input() navDataSet: IbMainMenuDataSet;
  @Output() actionDo: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    ) {}
/**
 * For UpRight  e bottomLeft buttons
 */
  emitAction(event, element) {
    event.stopPropagation();
    this.actionDo.emit(element);
  }

  calcBoxWidth(numElements) {
    const cost = Math.ceil(numElements / 5);
    let width = cost * 232;
    numElements > 5 ? width = width + 10 * cost * 0.75 : null;
    return width + 'px';
  }

  calcSecondLevelWidth(numElements) {
    return 100 / Math.ceil(numElements / 5) + '%';
  }

}
