import * as fromTable from '../reducers/table.reducer';
import { selectTableState } from './table.selectors';

describe('Table Selectors', () => {
  it('should select the feature state', () => {
    const result = selectTableState({
      [fromTable.tableFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
