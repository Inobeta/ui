import * as fromTable from './table.actions';

describe('ibTableActionSaveConfig', () => {
  it('should return an action', () => {
    expect(fromTable.ibTableActionSaveConfig({ options: {}, tableName: 'test' }).type).toBe('[IbTable] IbTableAction SaveConfig');
  });
});
