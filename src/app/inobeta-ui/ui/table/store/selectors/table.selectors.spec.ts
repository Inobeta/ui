import * as fromTable from '../reducers/table.reducer';
import { ibTableSelectTotalRow } from './table.selectors';

describe('Table Selectors', () => {
  it('should select the totals feature state', () => {
    const result = ibTableSelectTotalRow.projector(fromTable.initialState);
    expect(result).toEqual(fromTable.initialState.totals);
  });
});
