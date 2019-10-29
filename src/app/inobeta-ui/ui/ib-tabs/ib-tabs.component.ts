import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

export class IbTabsItem {
  name: string;
  active: boolean;
}

@Component({
  selector: 'ib-tabs',
  template: `
    <div fxFlex fxLayoutAlign="space-between start">
      <a *ngFor="let item of this.tabs"
         [ngClass]="{'active': item.active}"
         href="javascript:void(0);" (click)="tabClick(item)">{{ item.name | translate }}</a>
    </div>
    <!--<ul class="nav nav-justified nav-pills">-->
    <!--<li *ngFor="let item of this.tabs"-->
    <!--[ngClass]="{-->
    <!--'active': item.active-->
    <!--}">-->
    <!--<a href="javascript:void(0);" (click)="tabClick(item)">{{ item.name | translate }}</a>-->
    <!--</li>-->
    <!--</ul>-->
  `
})
export class IbTabsComponent implements OnInit {

  @Input() tabs: IbTabsItem[];

  /* istanbul ignore start */
  @Output() onTabSelect: EventEmitter<any> = new EventEmitter<any>();
  /* istanbul ignore end */

  constructor() {}

  ngOnInit() {
    console.log(this.tabs);
  }

  tabClick(item: IbTabsItem) {
    this.tabs.forEach( (t) => {
      t.active = false;
    });
    item.active = true;
    this.onTabSelect.emit(item);
  }
} /* istanbul ignore next */
