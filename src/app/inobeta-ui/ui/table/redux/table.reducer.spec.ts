import * as actions from './table.action';
import { tableFiltersReducer } from './table.reducer';
import { async } from '@angular/core/testing';

describe('tableFiltersReducer', () => {

  let MOCK_INITIAL_STATE_EMPTY = {
    tableFilters: {}
  };

  beforeEach(async(() => {
    MOCK_INITIAL_STATE_EMPTY = {
      tableFilters: {}
    };
  }));


  it('resetFilters', () => {
    let state = tableFiltersReducer({
      ...MOCK_INITIAL_STATE_EMPTY,
      tableFilters: { prova: {} }
    }, actions.resetFilters);
    expect(state.tableFilters).toEqual({});


    state = tableFiltersReducer(undefined, actions.resetFilters);
    expect(state.tableFilters).toEqual({});
  });

  it('addFilterToTable', () => {
    let state = tableFiltersReducer({
      ...MOCK_INITIAL_STATE_EMPTY
    }, actions.addFilterToTable({
      tableName: 'prova',
      filterName: 'colonna',
      filterValue: 'pippo'
    }));
    expect(state.tableFilters.prova).toEqual({
      colonna: { value: 'pippo'}
    });

    state = tableFiltersReducer({
      ...state
    }, actions.addFilterToTable({
      tableName: 'prova',
      filterName: 'colonna',
      filterValue: 'pluto'
    }));
    expect(state.tableFilters.prova).toEqual({
      colonna: { value: 'pluto'}
    });


    state = tableFiltersReducer({
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
    let state = tableFiltersReducer({
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

    state = tableFiltersReducer({
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
    let state = tableFiltersReducer({
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

    state = tableFiltersReducer({
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
