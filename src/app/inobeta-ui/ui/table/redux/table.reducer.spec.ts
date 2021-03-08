import * as actions from './table.action';
import { ibTableFiltersReducer } from './table.reducer';
import { async } from '@angular/core/testing';

describe('ibTableFiltersReducer', () => {

  let MOCK_INITIAL_STATE_EMPTY = {
    tableFilters: {}
  };

  beforeEach(async(() => {
    MOCK_INITIAL_STATE_EMPTY = {
      tableFilters: {}
    };
  }));


  it('resetFilters', () => {
    let state = ibTableFiltersReducer({
      ...MOCK_INITIAL_STATE_EMPTY,
      tableFilters: { prova: {} }
    }, actions.resetFilters);
    expect(state.tableFilters).toEqual({});


    state = ibTableFiltersReducer(undefined, actions.resetFilters);
    expect(state.tableFilters).toEqual({});
  });

  it('addFilterToTable', () => {
    let state = ibTableFiltersReducer({
      ...MOCK_INITIAL_STATE_EMPTY
    }, actions.addFilterToTable({
      tableName: 'prova',
      filterName: 'colonna',
      filterValue: 'pippo'
    }));
    expect(state.tableFilters.prova).toEqual({
      colonna: { value: 'pippo'}
    });

    state = ibTableFiltersReducer({
      ...state
    }, actions.addFilterToTable({
      tableName: 'prova',
      filterName: 'colonna',
      filterValue: 'pluto'
    }));
    expect(state.tableFilters.prova).toEqual({
      colonna: { value: 'pluto'}
    });


    state = ibTableFiltersReducer({
      ...state
    }, actions.addFilterToTable({
      tableName: 'prova',
      filterName: 'colonna2',
      filterValue: 'topolino'
    }));
    expect(state.tableFilters.prova).toEqual({
      colonna: { value: 'pluto'},
      colonna2: { value: 'topolino'}
    });
  });


  it('addSortToTable', () => {
    let state = ibTableFiltersReducer({
      ...MOCK_INITIAL_STATE_EMPTY
    }, actions.addSortToTable({
      tableName: 'prova',
      sortType: {
        active: 'yes',
        direction: 'asc'
      },
      emitChange: true
    }));
    expect(state.tableFilters.prova).toEqual({
      sortType: {
        active: 'yes',
        direction: 'asc'
      }
    });

    state = ibTableFiltersReducer({
      ...state
    }, actions.addSortToTable({
      tableName: 'prova',
      sortType: {
        active: 'no',
        direction: 'asc'
      },
      emitChange: true
    }));
    expect(state.tableFilters.prova).toEqual({
      sortType: {
        active: 'no',
        direction: 'asc'
      }
    });


  });

  it('addPaginatorFiltersToTable', () => {
    let state = ibTableFiltersReducer({
      ...MOCK_INITIAL_STATE_EMPTY
    }, actions.addPaginatorFiltersToTable({
      tableName: 'prova',
      previousPageIndex: 1,
      pageIndex: 2,
      pageSize: 10,
      lengthP: 5
    }));

    expect(state.tableFilters.prova).toEqual({
      paginatorFilters: {
        previousPageIndex: 1,
        pageIndex: 2,
        pageSize: 10,
        lengthP: 5
      }
    });

    state = ibTableFiltersReducer({
      ...state
    }, actions.addPaginatorFiltersToTable({
      tableName: 'prova',
      previousPageIndex: 1,
      pageIndex: 2,
      pageSize: 20,
      lengthP: 12
    }));

    expect(state.tableFilters.prova).toEqual({
      paginatorFilters: {
        previousPageIndex: 1,
        pageIndex: 2,
        pageSize: 20,
        lengthP: 12
      }
    });


  });

});
