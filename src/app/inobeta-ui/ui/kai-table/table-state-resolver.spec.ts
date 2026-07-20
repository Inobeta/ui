import { Sort } from '@angular/material/sort';
import { resolveInitialTableState } from './table-state-resolver';
import {
  IbKaiTableSnapshot,
  IbKaiTableUrlParams,
  IbKaiTableViewSnapshot,
  IbTableDef,
} from './table.types';

describe('resolveInitialTableState', () => {

  // -----------------------------------------------------------------------
  // Fixture helpers
  // -----------------------------------------------------------------------
  const sortA: Sort = { active: 'name', direction: 'asc' };
  const sortB: Sort = { active: 'date', direction: 'desc' };
  const filtersA = { search: 'hello' };
  const filtersB = { status: 'draft' };
  const aggregatedA: Record<string, string> = { colA: 'sum' };
  const aggregatedB: Record<string, string> = { colB: 'avg' };

  // -----------------------------------------------------------------------
  // 1. Technical defaults (no config)
  // -----------------------------------------------------------------------
  describe('with no params (technical defaults)', () => {

    it('should return technical defaults when called with an empty object', () => {
      const state = resolveInitialTableState({});

      expect(state.sort).toBeNull();
      expect(state.filters).toBeNull();
      expect(state.selectedView).toBeNull();
      expect(state.pageIndex).toBe(0);
      expect(state.pageSize).toBe(20);
      expect(state.aggregatedColumns).toEqual({});
    });

    it('should return technical defaults when tableDef is null', () => {
      const state = resolveInitialTableState({ tableDef: null });

      expect(state.sort).toBeNull();
      expect(state.filters).toBeNull();
      expect(state.selectedView).toBeNull();
      expect(state.pageIndex).toBe(0);
      expect(state.pageSize).toBe(20);
      expect(state.aggregatedColumns).toEqual({});
    });

    it('should return technical defaults when urlParams is null', () => {
      const state = resolveInitialTableState({
        urlParams: null,
      });

      expect(state.sort).toBeNull();
      expect(state.pageIndex).toBe(0);
      expect(state.pageSize).toBe(20);
    });

    it('should return technical defaults when both view snapshots are null', () => {
      const state = resolveInitialTableState({
        initialViewSnapshot: null,
        urlViewSnapshot: null,
      });

      expect(state.sort).toBeNull();
      expect(state.filters).toBeNull();
      expect(state.pageIndex).toBe(0);
      expect(state.pageSize).toBe(20);
    });
  });

  // -----------------------------------------------------------------------
  // 2. tableDef.initial* fields (Layer 2)
  // -----------------------------------------------------------------------
  describe('with tableDef.initial* (layer 2)', () => {

    describe('initial* set to concrete values', () => {

      it('should apply initialSort from tableDef', () => {
        const tableDef: IbTableDef = { initialSort: sortA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.sort).toEqual(sortA);
      });

      it('should apply initialFilters from tableDef', () => {
        const tableDef: IbTableDef = { initialFilters: filtersA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.filters).toEqual(filtersA);
      });

      it('should apply initialView from tableDef', () => {
        const tableDef: IbTableDef = { initialView: 'my-view' };
        const state = resolveInitialTableState({ tableDef });
        expect(state.selectedView).toBe('my-view');
      });

      it('should apply initialPageIndex from tableDef', () => {
        const tableDef: IbTableDef = { initialPageIndex: 3 };
        const state = resolveInitialTableState({ tableDef });
        expect(state.pageIndex).toBe(3);
      });

      it('should apply initialPageSize from tableDef', () => {
        const tableDef: IbTableDef = { initialPageSize: 50 };
        const state = resolveInitialTableState({ tableDef });
        expect(state.pageSize).toBe(50);
      });

      it('should apply initialAggregatedColumns from tableDef', () => {
        const tableDef: IbTableDef = { initialAggregatedColumns: aggregatedA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.aggregatedColumns).toEqual(aggregatedA);
      });

      it('should apply all initial* fields together from tableDef', () => {
        const tableDef: IbTableDef = {
          initialSort: sortA,
          initialFilters: filtersA,
          initialView: 'view-1',
          initialPageIndex: 2,
          initialPageSize: 10,
          initialAggregatedColumns: aggregatedA,
        };
        const state = resolveInitialTableState({ tableDef });

        expect(state.sort).toEqual(sortA);
        expect(state.filters).toEqual(filtersA);
        expect(state.selectedView).toBe('view-1');
        expect(state.pageIndex).toBe(2);
        expect(state.pageSize).toBe(10);
        expect(state.aggregatedColumns).toEqual(aggregatedA);
      });
    });

    describe('initial* explicitly set to null', () => {

      it('should set sort to null when initialSort is explicitly null', () => {
        const tableDef: IbTableDef = { initialSort: null };
        const state = resolveInitialTableState({ tableDef });
        // null means "no sort" — same as technical default, but explicit
        expect(state.sort).toBeNull();
      });

      it('should set filters to null when initialFilters is explicitly null', () => {
        const tableDef: IbTableDef = { initialFilters: null };
        const state = resolveInitialTableState({ tableDef });
        expect(state.filters).toBeNull();
      });

      it('should set selectedView to null when initialView is explicitly null', () => {
        const tableDef: IbTableDef = { initialView: null };
        const state = resolveInitialTableState({ tableDef });
        expect(state.selectedView).toBeNull();
      });

      it('should fall back to technical default for pageIndex when initialPageIndex is null', () => {
        const tableDef: IbTableDef = { initialPageIndex: null };
        const state = resolveInitialTableState({ tableDef });
        expect(state.pageIndex).toBe(0);
      });

      it('should fall back to technical default for pageSize when initialPageSize is null', () => {
        const tableDef: IbTableDef = { initialPageSize: null };
        const state = resolveInitialTableState({ tableDef });
        expect(state.pageSize).toBe(20);
      });

      it('should fall back to empty object for aggregatedColumns when initialAggregatedColumns is null', () => {
        const tableDef: IbTableDef = { initialAggregatedColumns: null };
        const state = resolveInitialTableState({ tableDef });
        expect(state.aggregatedColumns).toEqual({});
      });
    });

    describe('initial* key absent vs present-with-null', () => {

      it('should not modify sort when initialSort key is absent from tableDef', () => {
        // tableDef has no initialSort key at all — should keep technical default
        const tableDef: IbTableDef = { initialFilters: filtersA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.sort).toBeNull(); // retained from technical defaults
        expect(state.filters).toEqual(filtersA);
      });

      it('should not modify filters when initialFilters key is absent from tableDef', () => {
        const tableDef: IbTableDef = { initialSort: sortA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.filters).toBeNull(); // retained from technical defaults
        expect(state.sort).toEqual(sortA);
      });

      it('should not modify selectedView when initialView key is absent from tableDef', () => {
        const tableDef: IbTableDef = { initialSort: sortA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.selectedView).toBeNull(); // retained from technical defaults
      });

      it('should not modify pageIndex when initialPageIndex key is absent from tableDef', () => {
        const tableDef: IbTableDef = { initialSort: sortA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.pageIndex).toBe(0); // retained from technical defaults
      });

      it('should not modify pageSize when initialPageSize key is absent from tableDef', () => {
        const tableDef: IbTableDef = { initialSort: sortA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.pageSize).toBe(20); // retained from technical defaults
      });

      it('should not modify aggregatedColumns when initialAggregatedColumns key is absent from tableDef', () => {
        const tableDef: IbTableDef = { initialSort: sortA };
        const state = resolveInitialTableState({ tableDef });
        expect(state.aggregatedColumns).toEqual({}); // retained from technical defaults
      });

      it('should distinguish absent vs present-with-null for tableDef fields that differ from technical defaults', () => {
        // Technical default for selectedView is null.
        // absent initialView → retains technical default (null)
        // initialView='my-view' → explicitly set
        const tableDefAbsent: IbTableDef = {};
        const stateAbsent = resolveInitialTableState({ tableDef: tableDefAbsent });
        expect(stateAbsent.selectedView).toBeNull();

        const tableDefSet: IbTableDef = { initialView: 'my-view' };
        const stateSet = resolveInitialTableState({ tableDef: tableDefSet });
        expect(stateSet.selectedView).toBe('my-view');

        // initialView=null → explicit clear (same as technical default but explicit)
        const tableDefNull: IbTableDef = { initialView: null };
        const stateNull = resolveInitialTableState({ tableDef: tableDefNull });
        expect(stateNull.selectedView).toBeNull();
      });
    });
  });

  // -----------------------------------------------------------------------
  // 3. initialViewSnapshot overrides tableDef (Layer 3 vs Layer 2)
  // -----------------------------------------------------------------------
  describe('with initialViewSnapshot (layer 3)', () => {

    it('should override tableDef sort when initialViewSnapshot has sort', () => {
      const tableDef: IbTableDef = { initialSort: sortA };
      const viewSnapshot: IbKaiTableViewSnapshot = { sort: sortB };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.sort).toEqual(sortB);
    });

    it('should override tableDef filters when initialViewSnapshot has filters', () => {
      const tableDef: IbTableDef = { initialFilters: filtersA };
      const viewSnapshot: IbKaiTableViewSnapshot = { filters: filtersB };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.filters).toEqual(filtersB);
    });

    it('should override tableDef pageSize when initialViewSnapshot has pageSize', () => {
      const tableDef: IbTableDef = { initialPageSize: 10 };
      const viewSnapshot: IbKaiTableViewSnapshot = { pageSize: 50 };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.pageSize).toBe(50);
    });

    it('should override tableDef aggregatedColumns when initialViewSnapshot has aggregatedColumns', () => {
      const tableDef: IbTableDef = { initialAggregatedColumns: aggregatedA };
      const viewSnapshot: IbKaiTableViewSnapshot = {
        aggregatedColumns: aggregatedB,
      };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.aggregatedColumns).toEqual(aggregatedB);
    });

    it('should not override tableDef fields that are absent from initialViewSnapshot', () => {
      const tableDef: IbTableDef = {
        initialSort: sortA,
        initialFilters: filtersA,
        initialPageIndex: 3,
        initialPageSize: 10,
        initialAggregatedColumns: aggregatedA,
      };
      // viewSnapshot only has sort — other keys are absent
      const viewSnapshot: IbKaiTableViewSnapshot = { sort: sortB };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });

      // sort overridden by view
      expect(state.sort).toEqual(sortB);
      // these are NOT in the view, so tableDef values remain
      expect(state.filters).toEqual(filtersA);
      expect(state.pageIndex).toBe(3);
      expect(state.pageSize).toBe(10);
      expect(state.aggregatedColumns).toEqual(aggregatedA);
    });

    it('should clear sort when initialViewSnapshot has sort=null', () => {
      const tableDef: IbTableDef = { initialSort: sortA };
      const viewSnapshot: IbKaiTableViewSnapshot = { sort: null };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.sort).toBeNull();
    });

    it('should clear filters when initialViewSnapshot has filters=null', () => {
      const tableDef: IbTableDef = { initialFilters: filtersA };
      const viewSnapshot: IbKaiTableViewSnapshot = { filters: null };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.filters).toBeNull();
    });

    it('should fall back to technical defaults for pageSize when view has pageSize=null', () => {
      const tableDef: IbTableDef = { initialPageSize: 10 };
      const viewSnapshot: IbKaiTableViewSnapshot = { pageSize: null };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.pageSize).toBe(20);
    });

    it('should fall back to empty object for aggregatedColumns when view has aggregatedColumns=null', () => {
      const tableDef: IbTableDef = {
        initialAggregatedColumns: aggregatedA,
      };
      const viewSnapshot: IbKaiTableViewSnapshot = { aggregatedColumns: null };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.aggregatedColumns).toEqual({});
    });

    it('should not modify selectedView from initialViewSnapshot (views do not carry view ID)', () => {
      const tableDef: IbTableDef = { initialView: 'table-view' };
      const viewSnapshot: IbKaiTableViewSnapshot = { sort: sortA };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: viewSnapshot,
      });
      expect(state.selectedView).toBe('table-view');
    });

    it('should skip layer 3 entirely when initialViewSnapshot is null', () => {
      const tableDef: IbTableDef = {
        initialSort: sortA,
        initialFilters: filtersA,
      };
      const state = resolveInitialTableState({
        tableDef,
        initialViewSnapshot: null,
      });
      expect(state.sort).toEqual(sortA);
      expect(state.filters).toEqual(filtersA);
    });
  });

  // -----------------------------------------------------------------------
  // 4. urlViewSnapshot overrides initialViewSnapshot (Layer 4 vs Layer 3)
  // -----------------------------------------------------------------------
  describe('with urlViewSnapshot (layer 4)', () => {

    it('should override initialViewSnapshot when urlViewSnapshot has the same key', () => {
      const initialView: IbKaiTableViewSnapshot = { sort: sortA, filters: filtersA };
      const urlView: IbKaiTableViewSnapshot = { sort: sortB, filters: filtersB };
      const state = resolveInitialTableState({
        initialViewSnapshot: initialView,
        urlViewSnapshot: urlView,
      });
      expect(state.sort).toEqual(sortB);
      expect(state.filters).toEqual(filtersB);
    });

    it('should retain initialViewSnapshot values when urlViewSnapshot key is absent', () => {
      const initialView: IbKaiTableViewSnapshot = {
        sort: sortA,
        filters: filtersA,
        pageSize: 10,
      };
      // urlView only has sort — filters and pageSize are absent
      const urlView: IbKaiTableViewSnapshot = { sort: sortB };
      const state = resolveInitialTableState({
        initialViewSnapshot: initialView,
        urlViewSnapshot: urlView,
      });
      expect(state.sort).toEqual(sortB);
      expect(state.filters).toEqual(filtersA);
      expect(state.pageSize).toBe(10);
    });

    it('should also override tableDef (layer 4 overrides layer 2)', () => {
      const tableDef: IbTableDef = { initialSort: sortA, initialPageSize: 10 };
      const urlView: IbKaiTableViewSnapshot = { sort: sortB, pageSize: 30 };
      const state = resolveInitialTableState({
        tableDef,
        urlViewSnapshot: urlView,
      });
      expect(state.sort).toEqual(sortB);
      expect(state.pageSize).toBe(30);
    });

    it('should skip layer 4 entirely when urlViewSnapshot is null', () => {
      const initialView: IbKaiTableViewSnapshot = {
        sort: sortA,
        filters: filtersA,
      };
      const state = resolveInitialTableState({
        initialViewSnapshot: initialView,
        urlViewSnapshot: null,
      });
      expect(state.sort).toEqual(sortA);
      expect(state.filters).toEqual(filtersA);
    });
  });

  // -----------------------------------------------------------------------
  // 5. Explicit URL fields override views (Layer 5 vs Layer 4)
  // -----------------------------------------------------------------------
  describe('with urlParams explicit values (layer 5)', () => {

    it('should override urlViewSnapshot sort with explicit URL sort', () => {
      const urlView: IbKaiTableViewSnapshot = { sort: sortA };
      const urlParams: IbKaiTableUrlParams = { sort: sortB };
      const state = resolveInitialTableState({
        urlViewSnapshot: urlView,
        urlParams,
      });
      expect(state.sort).toEqual(sortB);
    });

    it('should override urlViewSnapshot filters with explicit URL filters', () => {
      const urlView: IbKaiTableViewSnapshot = { filters: filtersA };
      const urlParams: IbKaiTableUrlParams = { filters: filtersB };
      const state = resolveInitialTableState({
        urlViewSnapshot: urlView,
        urlParams,
      });
      expect(state.filters).toEqual(filtersB);
    });

    it('should override urlViewSnapshot view (selectedView) with explicit URL view', () => {
      const urlView: IbKaiTableViewSnapshot = { sort: sortA };
      const urlParams: IbKaiTableUrlParams = { view: 'url-view' };
      const state = resolveInitialTableState({
        urlViewSnapshot: urlView,
        urlParams,
      });
      expect(state.selectedView).toBe('url-view');
    });

    it('should override urlViewSnapshot pageIndex with explicit URL pageIndex', () => {
      const urlView: IbKaiTableViewSnapshot = { pageSize: 10 };
      const urlParams: IbKaiTableUrlParams = { pageIndex: 5 };
      const state = resolveInitialTableState({
        urlViewSnapshot: urlView,
        urlParams,
      });
      expect(state.pageIndex).toBe(5);
    });

    it('should override urlViewSnapshot pageSize with explicit URL pageSize', () => {
      const urlView: IbKaiTableViewSnapshot = { pageSize: 10 };
      const urlParams: IbKaiTableUrlParams = { pageSize: 100 };
      const state = resolveInitialTableState({
        urlViewSnapshot: urlView,
        urlParams,
      });
      expect(state.pageSize).toBe(100);
    });

    it('should override urlViewSnapshot aggregatedColumns with explicit URL aggregatedColumns', () => {
      const urlView: IbKaiTableViewSnapshot = { aggregatedColumns: aggregatedA };
      const urlParams: IbKaiTableUrlParams = { aggregatedColumns: aggregatedB };
      const state = resolveInitialTableState({
        urlViewSnapshot: urlView,
        urlParams,
      });
      expect(state.aggregatedColumns).toEqual(aggregatedB);
    });

    it('should override tableDef when urlParams is present (full chain)', () => {
      // Proves that layer 5 beats layer 2 (URL wins over initial config)
      const tableDef: IbTableDef = {
        initialSort: sortA,
        initialPageSize: 10,
      };
      const urlParams: IbKaiTableUrlParams = { sort: sortB, pageSize: 100 };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.sort).toEqual(sortB);
      expect(state.pageSize).toBe(100);
    });

    it('should skip layer 5 entirely when urlParams is null', () => {
      const tableDef: IbTableDef = { initialSort: sortA };
      const state = resolveInitialTableState({
        tableDef,
        urlParams: null,
      });
      expect(state.sort).toEqual(sortA);
    });
  });

  // -----------------------------------------------------------------------
  // 6. Absent URL field retains previous value (partial URL payload)
  // -----------------------------------------------------------------------
  describe('partial URL payload (absent key retains previous value)', () => {

    it('should retain tableDef sort when URL sort is absent', () => {
      const tableDef: IbTableDef = { initialSort: sortA };
      // urlParams present but sort key absent
      const urlParams: IbKaiTableUrlParams = { filters: filtersA };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.sort).toEqual(sortA);
      expect(state.filters).toEqual(filtersA);
    });

    it('should retain view snapshot sort when URL sort is absent', () => {
      const viewSnapshot: IbKaiTableViewSnapshot = { sort: sortA };
      const urlParams: IbKaiTableUrlParams = { pageIndex: 3 };
      const state = resolveInitialTableState({
        initialViewSnapshot: viewSnapshot,
        urlParams,
      });
      expect(state.sort).toEqual(sortA);
      expect(state.pageIndex).toBe(3);
    });

    it('should retain previous filters when URL only sets sort', () => {
      const tableDef: IbTableDef = { initialFilters: filtersA };
      const urlParams: IbKaiTableUrlParams = { sort: sortB };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.sort).toEqual(sortB);
      expect(state.filters).toEqual(filtersA);
    });

    it('should retain technical default pageSize when URL only sets pageIndex', () => {
      const urlParams: IbKaiTableUrlParams = { pageIndex: 7 };
      const state = resolveInitialTableState({ urlParams });
      expect(state.pageIndex).toBe(7);
      expect(state.pageSize).toBe(20);
    });

    it('should retain technical default aggregatedColumns when URL only sets sort', () => {
      const urlParams: IbKaiTableUrlParams = { sort: sortA };
      const state = resolveInitialTableState({ urlParams });
      expect(state.sort).toEqual(sortA);
      expect(state.aggregatedColumns).toEqual({});
    });
  });

  // -----------------------------------------------------------------------
  // 7. null semantics for filters, sort, selectedView, aggregatedColumns
  // -----------------------------------------------------------------------
  describe('null semantics in urlParams', () => {

    it('should clear sort when URL sort is explicitly null (overrides previous)', () => {
      const tableDef: IbTableDef = { initialSort: sortA };
      const urlParams: IbKaiTableUrlParams = { sort: null };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.sort).toBeNull();
    });

    it('should clear filters when URL filters is explicitly null', () => {
      const tableDef: IbTableDef = { initialFilters: filtersA };
      const urlParams: IbKaiTableUrlParams = { filters: null };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.filters).toBeNull();
    });

    it('should set selectedView to null when URL view is explicitly null', () => {
      const tableDef: IbTableDef = { initialView: 'some-view' };
      const urlParams: IbKaiTableUrlParams = { view: null };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.selectedView).toBeNull();
    });

    it('should fall back to empty object for aggregatedColumns when URL aggregatedColumns is null', () => {
      const tableDef: IbTableDef = {
        initialAggregatedColumns: aggregatedA,
      };
      const urlParams: IbKaiTableUrlParams = { aggregatedColumns: null };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.aggregatedColumns).toEqual({});
    });

    it('should differentiate sort absent vs sort=null in URL (absent retains, null clears)', () => {
      const tableDef: IbTableDef = { initialSort: sortA };

      // sort key absent from URL → tableDef value retained
      const absent: IbKaiTableUrlParams = {};
      const stateAbsent = resolveInitialTableState({
        tableDef,
        urlParams: absent,
      });
      expect(stateAbsent.sort).toEqual(sortA);

      // sort key present with null → cleared
      const presentNull: IbKaiTableUrlParams = { sort: null };
      const stateNull = resolveInitialTableState({
        tableDef,
        urlParams: presentNull,
      });
      expect(stateNull.sort).toBeNull();
    });

    it('should differentiate view absent vs view=null in URL', () => {
      const tableDef: IbTableDef = { initialView: 'my-view' };

      // view key absent → tableDef value retained
      const absent: IbKaiTableUrlParams = {};
      const stateAbsent = resolveInitialTableState({
        tableDef,
        urlParams: absent,
      });
      expect(stateAbsent.selectedView).toBe('my-view');

      // view key present with null → cleared (force "all data")
      const presentNull: IbKaiTableUrlParams = { view: null };
      const stateNull = resolveInitialTableState({
        tableDef,
        urlParams: presentNull,
      });
      expect(stateNull.selectedView).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // 8. null and invalid values for pageIndex / pageSize
  // -----------------------------------------------------------------------
  describe('null / fallback values for pageIndex and pageSize', () => {

    it('should fall back to technical default (0) when URL pageIndex is null', () => {
      const tableDef: IbTableDef = { initialPageIndex: 5 };
      const urlParams: IbKaiTableUrlParams = { pageIndex: null };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.pageIndex).toBe(0);
    });

    it('should fall back to technical default (20) when URL pageSize is null', () => {
      const tableDef: IbTableDef = { initialPageSize: 50 };
      const urlParams: IbKaiTableUrlParams = { pageSize: null };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.pageSize).toBe(20);
    });

    it('should fall back to technical default when tableDef pageIndex is null', () => {
      const tableDef: IbTableDef = { initialPageIndex: null };
      const state = resolveInitialTableState({ tableDef });
      expect(state.pageIndex).toBe(0);
    });

    it('should fall back to technical default when tableDef pageSize is null', () => {
      const tableDef: IbTableDef = { initialPageSize: null };
      const state = resolveInitialTableState({ tableDef });
      expect(state.pageSize).toBe(20);
    });

    it('should accept pageIndex=0 as a valid explicit value (not fallback)', () => {
      const urlParams: IbKaiTableUrlParams = { pageIndex: 0 };
      const state = resolveInitialTableState({ urlParams });
      expect(state.pageIndex).toBe(0); // 0 is valid, not null
    });
  });

  // -----------------------------------------------------------------------
  // 9. Unknown / unresolved view and selectedView URL null
  // -----------------------------------------------------------------------
  describe('unknown / unresolved view', () => {

    it('should set selectedView to the URL view even when urlViewSnapshot is null (unresolved view)', () => {
      // Simulates: URL has view=unknown-view, but the views provider couldn't
      // resolve it (urlViewSnapshot=null). The view ID should still be stored.
      const urlParams: IbKaiTableUrlParams = { view: 'unknown-view' };
      const state = resolveInitialTableState({
        urlViewSnapshot: null,
        urlParams,
      });
      expect(state.selectedView).toBe('unknown-view');
      // Other fields fall back to technical defaults (no view snapshot to apply)
      expect(state.sort).toBeNull();
      expect(state.filters).toBeNull();
      expect(state.pageSize).toBe(20);
    });

    it('should retain view-specific settings from lower layers when URL view is unresolved', () => {
      // tableDef sets filters and view; URL has an unknown view ID.
      // The unknown view doesn't provide a snapshot, but the view ID from URL
      // should still override tableDef.initialView.
      const tableDef: IbTableDef = {
        initialFilters: filtersA,
        initialView: 'original-view',
      };
      const urlParams: IbKaiTableUrlParams = { view: 'unknown-view' };
      const state = resolveInitialTableState({
        tableDef,
        urlViewSnapshot: null,
        urlParams,
      });
      expect(state.selectedView).toBe('unknown-view');
      // filters from tableDef retained (no view snapshot to override them,
      // URL filters key is absent)
      expect(state.filters).toEqual(filtersA);
    });

    it('should set selectedView to null when URL view is null (force "all data")', () => {
      const tableDef: IbTableDef = { initialView: 'my-view' };
      const urlParams: IbKaiTableUrlParams = { view: null };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.selectedView).toBeNull();
    });

    it('should set selectedView to null when both URL view and initialView are null', () => {
      const tableDef: IbTableDef = { initialView: null };
      const urlParams: IbKaiTableUrlParams = { view: null };
      const state = resolveInitialTableState({ tableDef, urlParams });
      expect(state.selectedView).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Purity guarantees
  // -----------------------------------------------------------------------
  describe('purity', () => {

    it('should return a fresh snapshot object on each call', () => {
      const state1 = resolveInitialTableState({});
      const state2 = resolveInitialTableState({});
      expect(state1).not.toBe(state2);
    });

    it('should return correct aggregatedColumns values on successive calls', () => {
      // Note: nested objects from input params are assigned by reference,
      // so successive calls with the same tableDef may share the same
      // aggregatedColumns instance.  The top-level snapshot is fresh.
      const tableDef: IbTableDef = { initialAggregatedColumns: aggregatedA };
      const state1 = resolveInitialTableState({ tableDef });
      const state2 = resolveInitialTableState({ tableDef });
      expect(state1.aggregatedColumns).toEqual(aggregatedA);
      expect(state2.aggregatedColumns).toEqual(aggregatedA);
    });

    it('should not mutate the input tableDef object', () => {
      const tableDef: IbTableDef = {
        initialSort: sortA,
        initialFilters: filtersA,
        initialPageIndex: 2,
      };
      const tableDefSnapshot = JSON.stringify(tableDef);

      resolveInitialTableState({ tableDef });

      // After the call, tableDef should be unchanged
      expect(JSON.stringify(tableDef)).toBe(tableDefSnapshot);
    });

    it('should not mutate the input urlParams object', () => {
      const urlParams: IbKaiTableUrlParams = {
        sort: sortA,
        pageIndex: 3,
      };
      const urlParamsSnapshot = JSON.stringify(urlParams);

      resolveInitialTableState({ urlParams });

      expect(JSON.stringify(urlParams)).toBe(urlParamsSnapshot);
    });

    it('should not mutate the input view snapshot', () => {
      const viewSnapshot: IbKaiTableViewSnapshot = {
        sort: sortA,
        filters: filtersA,
      };
      const viewSnapshotCopy = JSON.stringify(viewSnapshot);

      resolveInitialTableState({ initialViewSnapshot: viewSnapshot });

      expect(JSON.stringify(viewSnapshot)).toBe(viewSnapshotCopy);
    });

    it('should not share aggregatedColumns reference with the technical defaults', () => {
      const state = resolveInitialTableState({});
      // Modifying the returned aggregatedColumns should not affect future calls
      state.aggregatedColumns['hacked'] = 'injected';
      const state2 = resolveInitialTableState({});
      expect(state2.aggregatedColumns).toEqual({});
    });

    it('should not mutate the input tableDef object when resolving aggregatedColumns', () => {
      const tableDef: IbTableDef = { initialAggregatedColumns: { colA: 'sum' } };
      const tableDefSnapshot = JSON.stringify(tableDef);

      resolveInitialTableState({ tableDef });
      expect(JSON.stringify(tableDef)).toBe(tableDefSnapshot);
    });
  });
});
