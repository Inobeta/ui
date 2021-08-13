import * as fromTable from './table.actions';

describe('ibTableActionSaveConfig', () => {
  it('should return an action', () => {
    expect(fromTable.ibTableActionSaveConfig({ name: 'test' }).type).toBe('[IbTable] IbTableAction SaveConfig');
  });
});
