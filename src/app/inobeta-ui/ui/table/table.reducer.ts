import {Action} from 'redux';
import {Injectable} from '@angular/core';
import {StateAction} from '../../redux/tools';



/** State Interface **/
export interface ITableHandler {
  items: any[];
  filteredItems: any[];
  filterConditions: any;
  sortField: any;
}
export const TABLE_INITIAL_STATE: ITableHandler = {
  items: [],
  filteredItems: [],
  filterConditions: {
    generic: ''
  },
  sortField: null
};

@Injectable()
export class TableActions {
  static SERVER_LOAD = '[Table] SERVER_LOAD';
  static LOCAL_FILTER = '[Table] LOCAL_FILTER';
  static LOCAL_SORT = '[Table] LOCAL_SORT';
  static FILTER_RESET = '[Table] FILTER_RESET';

}



/** Reducer (BL) **/
export function tableReducer(
  lastState: ITableHandler,
  a: Action,
  type: string): ITableHandler {

  const action = a as StateAction;

  let filteredItems, filterCond;

  switch (type) {
    case TableActions.SERVER_LOAD:
      filterCond = getFilterCond(lastState.filterConditions, {});
      filteredItems = filterData(action.payload, filterCond);
      return Object.assign({}, lastState, {
        items: action.payload,
        filteredItems: filteredItems
      });

    case TableActions.LOCAL_FILTER:
      if (action.payload['generic']) {
        action.payload['generic'] = action.payload['generic'].currentTarget.value;
      }
      filterCond = getFilterCond(lastState.filterConditions, action.payload);
      filteredItems = filterData(lastState.items, filterCond);
      return Object.assign({}, lastState, {
        filteredItems: filteredItems,
        filterConditions: filterCond
      });

    case TableActions.LOCAL_SORT:
      return Object.assign({}, lastState, {
        sortField: action.payload
      });

    case TableActions.FILTER_RESET:
      filterCond = {
        generic: ''
      };
      filteredItems = lastState.items.slice();

      return Object.assign({}, lastState, {
        filteredItems: filteredItems,
        filterConditions: filterCond
      });

  }
  return lastState;
}


function filterData(items, filterCond) {
  const filteredItems = [];
  items.map(el => {
    const itemKeys = Object.keys(el);
    let includeRecord = false;

    if (filterCond['generic'] || filterCond['tags'] || filterCond['channel']) {
      let includeFromGeneric = false;

      if (!filterCond['generic']) { includeFromGeneric = true; } else {
        for (let i = 0; i < itemKeys.length; i++) {
          if (el[itemKeys[i]]
            && el[itemKeys[i]].toString
            && el[itemKeys[i]].toString().toLowerCase
            && el[itemKeys[i]].toString().toLowerCase().match(filterCond['generic'].toLowerCase())

          ) {
            includeFromGeneric = true;
            break;
          }
        }
      }

      if (includeFromGeneric ) {
        includeRecord = true;
      }

    } else {
      includeRecord = true;
    }

    if (includeRecord) {
      filteredItems.push(el);
    }
  });
  return filteredItems;
}


function getFilterCond(lastFilters, newFilters) {
  const filterCond = Object.assign({}, lastFilters, newFilters);
  const filterKeys = Object.keys(filterCond);
  for (let i = 0; i < filterKeys.length; i++ ) {
    if (filterKeys[i] !== 'generic' && filterCond[filterKeys[i]].length === 0) {
      delete filterCond[filterKeys[i]];
    }
  }
  return filterCond;
}
