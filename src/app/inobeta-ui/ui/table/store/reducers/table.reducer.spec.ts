import { ibTableFeatureReducer, ibTableFeatureInitialState } from './table.reducer';

describe('Table Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = ibTableFeatureReducer(ibTableFeatureInitialState, action);

      expect(result).toBe(ibTableFeatureInitialState);
    });
  });
});
