import * as fromTable from '../reducers/table.reducer';
import { ibTableSelectTotalRow } from './table.selectors';

describe('Table Selectors', () => {
  it('should select the totals feature state', () => {
    const result = ibTableSelectTotalRow('test').projector(fromTable.ibTableFeatureInitialState);
    expect(result).toEqual(fromTable.ibTableFeatureInitialState.instances.find(i => i.tableName === 'test')?.config.totals);
  });
});
