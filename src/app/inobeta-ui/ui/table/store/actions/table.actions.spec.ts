import * as fromTable from './table.actions';

describe('ibTableActionSaveConfig', () => {
  it('should return an action', () => {
    expect(fromTable.ibTableActionSaveConfig({ configName: 'test', tableName: 'test' }).type).toBe('[IbTable] IbTableAction SaveConfig');
  });
});
