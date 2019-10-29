import {StateActions} from '../../redux/tools';
import {IAppState} from '../../../app.module';
import {NgRedux} from '@angular-redux/store';
import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  template: ``
})
export class TableInterfaceComponent {
  tableActions = null;
  detailPagePartialPath = [];
  constructor(
    private ngReduxP: NgRedux<IAppState>,
    private actionsP: StateActions,
    private routerP: Router
  ) {}

  onFilter(value) {
    if (!value) {
      this.ngReduxP.dispatch(this.actionsP.stateChange(null, this.tableActions.FILTER_RESET));
      return;
    }
    const filter = {};
    filter[value.key] = value.data;
    this.ngReduxP.dispatch(this.actionsP.stateChange(filter, this.tableActions.LOCAL_FILTER));
  }

  onSort(value) {
    this.ngReduxP.dispatch(this.actionsP.stateChange(value, this.tableActions.LOCAL_SORT));
  }

  goToPage(id) {
    this.routerP.navigate(this.detailPagePartialPath.concat(id));
  }

}
