import { Sort } from '@angular/material/sort';
import { decodeUrlPayload, encodeUrlPayload } from './table-url-codec';
import {
  IbKaiTableSnapshot,
  IbKaiTableUrlParams,
} from './table.types';

describe('table-url-codec', () => {

  // -----------------------------------------------------------------------
  // Fixtures
  // -----------------------------------------------------------------------
  const sortA: Sort = { active: 'name', direction: 'asc' };
  const sortB: Sort = { active: 'date', direction: 'desc' };
  const filtersA = { search: 'hello' };
  const filtersB = { status: 'draft' };
  const aggregatedA: Record<string, string> = { colA: 'sum' };

  function makeSnapshot(overrides: Partial<IbKaiTableSnapshot> = {}): IbKaiTableSnapshot {
    return {
      sort: null,
      filters: null,
      selectedView: null,
      pageIndex: 0,
      pageSize: 20,
      aggregatedColumns: {},
      ...overrides,
    };
  }

  // =========================================================================
  // 1. V2 round trip
  // =========================================================================
  describe('v2 round trip', () => {

    it('should encode and decode back to the same params (full snapshot)', () => {
      const snapshot: IbKaiTableSnapshot = makeSnapshot({
        sort: sortA,
        filters: filtersA,
        selectedView: 'view-1',
        pageIndex: 3,
        pageSize: 50,
        aggregatedColumns: aggregatedA,
      });

      const raw = encodeUrlPayload(snapshot);
      const decoded = decodeUrlPayload(raw)!;

      expect(decoded.sort).toEqual(sortA);
      expect(decoded.filters).toEqual(filtersA);
      expect(decoded.view).toBe('view-1');
      expect(decoded.pageIndex).toBe(3);
      expect(decoded.pageSize).toBe(50);
      expect(decoded.aggregatedColumns).toEqual(aggregatedA);
    });

    it('should encode and decode a snapshot with all null/zero defaults', () => {
      const snapshot = makeSnapshot();
      const raw = encodeUrlPayload(snapshot);
      const decoded = decodeUrlPayload(raw)!;

      expect(decoded.sort).toBeNull();
      expect(decoded.filters).toBeNull();
      expect(decoded.view).toBeNull();
      expect(decoded.pageIndex).toBe(0);
      expect(decoded.pageSize).toBe(20);
      expect(decoded.aggregatedColumns).toBeNull();
    });

    it('should encode empty aggregatedColumns as null', () => {
      const snapshot = makeSnapshot({ aggregatedColumns: {} });
      const raw = encodeUrlPayload(snapshot);
      const decoded = decodeUrlPayload(raw)!;

      expect(decoded.aggregatedColumns).toBeNull();
    });

    it('should encode sort=null as null', () => {
      const snapshot = makeSnapshot({ sort: null });
      const raw = encodeUrlPayload(snapshot);
      const decoded = decodeUrlPayload(raw)!;

      expect(decoded.sort).toBeNull();
    });

    it('should encode selectedView=null as null', () => {
      const snapshot = makeSnapshot({ selectedView: null });
      const raw = encodeUrlPayload(snapshot);
      const decoded = decodeUrlPayload(raw)!;

      expect(decoded.view).toBeNull();
    });

    it('should never contain the legacy sentinel __ibTableView__all', () => {
      const snapshot = makeSnapshot({ selectedView: null });
      const raw = encodeUrlPayload(snapshot);
      expect(raw).not.toContain('__ibTableView__all');
    });
  });

  // =========================================================================
  // 2. Partial v2 payload — absent vs present-with-null
  // =========================================================================
  describe('partial v2 payload — distinguishing absent from null', () => {

    it('should decode sort key as absent when not present in JSON', () => {
      const raw = '{"v":2,"f":null,"sv":null,"pi":0,"ps":20,"ac":null}';
      // 'so' key is absent from the JSON
      const params = decodeUrlPayload(raw)!;

      expect(params).toBeDefined();
      expect('sort' in params).toBeFalse();
      expect('filters' in params).toBeTrue();
      expect('view' in params).toBeTrue();
      expect('pageIndex' in params).toBeTrue();
      expect('pageSize' in params).toBeTrue();
      expect('aggregatedColumns' in params).toBeTrue();
    });

    it('should decode filters with null when explicitly set to null', () => {
      const raw = '{"v":2,"f":null,"sv":"view-x","pi":0,"ps":20,"ac":null,"so":null}';
      const params = decodeUrlPayload(raw)!;

      expect(params.filters).toBeNull();
      // Key is present with null value
      expect('filters' in params).toBeTrue();
    });

    it('should decode view with null when explicitly set to null', () => {
      const raw = '{"v":2,"f":null,"sv":null,"pi":0,"ps":20,"ac":null,"so":null}';
      const params = decodeUrlPayload(raw)!;

      expect(params.view).toBeNull();
      expect('view' in params).toBeTrue();
    });

    it('should decode only the fields that are present in the JSON', () => {
      // Only sort and pageIndex are present
      const raw = '{"v":2,"so":{"active":"name","direction":"asc"},"pi":5}';
      const params = decodeUrlPayload(raw)!;

      expect(params.sort).toEqual(sortA);
      expect(params.pageIndex).toBe(5);
      // These keys should be absent
      expect('filters' in params).toBeFalse();
      expect('view' in params).toBeFalse();
      expect('pageSize' in params).toBeFalse();
      expect('aggregatedColumns' in params).toBeFalse();
    });
  });

  // =========================================================================
  // 3. Legacy payload — complete
  // =========================================================================
  describe('legacy (v1) payload — complete', () => {

    it('should decode a complete legacy payload', () => {
      const raw = JSON.stringify({
        ibview: 'my-view',
        ibpage: 3,
        ibpagesize: 50,
        ibfilter: filtersA,
        ibaggregatedcolumns: aggregatedA,
        ibsort: sortA,
      });

      const params = decodeUrlPayload(raw)!;

      expect(params.view).toBe('my-view');
      expect(params.pageIndex).toBe(3);
      expect(params.pageSize).toBe(50);
      expect(params.filters).toEqual(filtersA);
      expect(params.aggregatedColumns).toEqual(aggregatedA);
      expect(params.sort).toEqual(sortA);
    });

    it('should decode a legacy payload with all default values', () => {
      const raw = JSON.stringify({
        ibview: '__ibTableView__all',
        ibpage: 0,
        ibpagesize: 20,
        ibfilter: {},
        ibaggregatedcolumns: {},
        ibsort: { active: '', direction: '' },
      });

      const params = decodeUrlPayload(raw)!;

      // Sentinel is mapped to null
      expect(params.view).toBeNull();
      expect(params.pageIndex).toBe(0);
      expect(params.pageSize).toBe(20);
    });
  });

  // =========================================================================
  // 4. Legacy payload — partial
  // =========================================================================
  describe('legacy (v1) payload — partial', () => {

    it('should decode a legacy payload with only ibsort', () => {
      const raw = JSON.stringify({
        ibsort: sortA,
      });

      const params = decodeUrlPayload(raw)!;

      expect(params.sort).toEqual(sortA);
      // Other keys should be absent
      expect('view' in params).toBeFalse();
      expect('pageIndex' in params).toBeFalse();
      expect('filters' in params).toBeFalse();
    });

    it('should decode a legacy payload with only ibpage and ibpagesize', () => {
      const raw = JSON.stringify({
        ibpage: 7,
        ibpagesize: 100,
      });

      const params = decodeUrlPayload(raw)!;

      expect(params.pageIndex).toBe(7);
      expect(params.pageSize).toBe(100);
      expect('sort' in params).toBeFalse();
      expect('view' in params).toBeFalse();
    });

    it('should decode a legacy payload with only ibfilter', () => {
      const raw = JSON.stringify({
        ibfilter: filtersA,
      });

      const params = decodeUrlPayload(raw)!;

      expect(params.filters).toEqual(filtersA);
      expect('sort' in params).toBeFalse();
      expect('pageIndex' in params).toBeFalse();
    });
  });

  // =========================================================================
  // 5. Legacy sentinel conversion
  // =========================================================================
  describe('legacy sentinel __ibTableView__all → null', () => {

    it('should map __ibTableView__all to view=null', () => {
      const raw = JSON.stringify({
        ibview: '__ibTableView__all',
      });

      const params = decodeUrlPayload(raw)!;

      expect(params.view).toBeNull();
      expect('view' in params).toBeTrue();
    });

    it('should keep a regular view ID as-is', () => {
      const raw = JSON.stringify({
        ibview: 'custom-view',
      });

      const params = decodeUrlPayload(raw)!;

      expect(params.view).toBe('custom-view');
    });

    it('should map ibview=null to view=null', () => {
      const raw = JSON.stringify({
        ibview: null,
      });

      const params = decodeUrlPayload(raw)!;

      expect(params.view).toBeNull();
    });
  });

  // =========================================================================
  // 6. Malformed JSON and invalid schema
  // =========================================================================
  describe('malformed JSON and invalid schema', () => {

    it('should return null for null input', () => {
      const params = decodeUrlPayload(null);
      expect(params).toBeNull();
    });

    it('should return null for empty string input', () => {
      const params = decodeUrlPayload('');
      expect(params).toBeNull();
    });

    it('should return null for unparseable JSON', () => {
      const params = decodeUrlPayload('not-json-at-all');
      expect(params).toBeNull();
    });

    it('should return null for a JSON array (not an object)', () => {
      const params = decodeUrlPayload('[1, 2, 3]');
      expect(params).toBeNull();
    });

    it('should return null for a JSON number (not an object)', () => {
      const params = decodeUrlPayload('42');
      expect(params).toBeNull();
    });

    it('should return null for a JSON string (not an object)', () => {
      const params = decodeUrlPayload('"hello"');
      expect(params).toBeNull();
    });

    it('should return null for JSON null (json literal)', () => {
      const params = decodeUrlPayload('null');
      expect(params).toBeNull();
    });

    it('should return null for JSON boolean', () => {
      const params = decodeUrlPayload('true');
      expect(params).toBeNull();
    });

    it('should normalize invalid pageIndex to null (non-number)', () => {
      const raw = JSON.stringify({ v: 2, pi: 'not-a-number' });
      const params = decodeUrlPayload(raw)!;

      expect(params.pageIndex).toBeNull();
    });

    it('should normalize invalid sort to null (non-object)', () => {
      const raw = JSON.stringify({ v: 2, so: 'invalid-sort' });
      const params = decodeUrlPayload(raw)!;

      expect(params.sort).toBeNull();
    });

    it('should normalize invalid filters to null (non-object)', () => {
      const raw = JSON.stringify({ v: 2, f: 'not-an-object' });
      const params = decodeUrlPayload(raw)!;

      expect(params.filters).toBeNull();
    });

    it('should normalize negative pageIndex to null', () => {
      const raw = JSON.stringify({ v: 2, pi: -1 });
      const params = decodeUrlPayload(raw)!;

      expect(params.pageIndex).toBeNull();
    });

    it('should normalize NaN pageIndex to null', () => {
      const raw = JSON.stringify({ v: 2, pi: NaN as unknown as number });
      const params = decodeUrlPayload(raw)!;

      expect(params.pageIndex).toBeNull();
    });

    it('should normalize Infinity pageIndex to null', () => {
      const raw = JSON.stringify({ v: 2, pi: Infinity as unknown as number });
      const params = decodeUrlPayload(raw)!;

      expect(params.pageIndex).toBeNull();
    });

    it('should normalize non-integer pageIndex to null', () => {
      const raw = JSON.stringify({ v: 2, pi: 3.5 });
      const params = decodeUrlPayload(raw)!;

      expect(params.pageIndex).toBeNull();
    });

    it('should accept pageIndex=0 as valid', () => {
      const raw = JSON.stringify({ v: 2, pi: 0 });
      const params = decodeUrlPayload(raw)!;

      expect(params.pageIndex).toBe(0);
    });

    it('should normalize invalid legacy page to null', () => {
      const raw = JSON.stringify({ ibpage: 'not-a-number' });
      const params = decodeUrlPayload(raw)!;

      expect(params!.pageIndex).toBeNull();
    });

    it('should normalize invalid legacy sort to null', () => {
      const raw = JSON.stringify({ ibsort: 123 });
      const params = decodeUrlPayload(raw)!;

      expect(params!.sort).toBeNull();
    });
  });

  // =========================================================================
  // 7. V2 version marker
  // =========================================================================
  describe('v2 version marker', () => {

    it('should decode a v2 payload that omits some fields', () => {
      // v2 payload with only version + sort
      const raw = '{"v":2,"so":{"active":"col","direction":"asc"}}';
      const params = decodeUrlPayload(raw)!;

      expect(params.sort).toEqual({ active: 'col', direction: 'asc' });
      expect('filters' in params).toBeFalse();
      expect('view' in params).toBeFalse();
      expect('pageIndex' in params).toBeFalse();
    });

    it('should not treat a non-2 version as v2', () => {
      // This has 'v' but not v=2 → falls through to legacy decoder
      const raw = JSON.stringify({ v: 1, ibsort: sortA });
      const params = decodeUrlPayload(raw)!;

      // Legacy decoder picks up ibsort
      expect(params.sort).toEqual(sortA);
    });
  });

  // =========================================================================
  // 8. Null semantics in v2 format
  // =========================================================================
  describe('null semantics in v2', () => {

    it('should decode filters=null as explicit clear (key present)', () => {
      const raw = '{"v":2,"f":null}';
      const params = decodeUrlPayload(raw)!;

      expect(params.filters).toBeNull();
      expect('filters' in params).toBeTrue();
    });

    it('should decode sort=null as explicit clear (key present)', () => {
      const raw = '{"v":2,"so":null}';
      const params = decodeUrlPayload(raw)!;

      expect(params.sort).toBeNull();
      expect('sort' in params).toBeTrue();
    });

    it('should decode view=null as explicit clear (key present)', () => {
      const raw = '{"v":2,"sv":null}';
      const params = decodeUrlPayload(raw)!;

      expect(params.view).toBeNull();
      expect('view' in params).toBeTrue();
    });

    it('should decode aggregatedColumns=null as explicit clear', () => {
      const raw = '{"v":2,"ac":null}';
      const params = decodeUrlPayload(raw)!;

      expect(params.aggregatedColumns).toBeNull();
      expect('aggregatedColumns' in params).toBeTrue();
    });
  });

  // =========================================================================
  // 9. Encoded payload structure
  // =========================================================================
  describe('encoded payload structure', () => {

    it('should produce valid JSON', () => {
      const snapshot = makeSnapshot();
      const raw = encodeUrlPayload(snapshot);

      expect(() => JSON.parse(raw)).not.toThrow();
    });

    it('should include version field v=2', () => {
      const snapshot = makeSnapshot();
      const raw = encodeUrlPayload(snapshot);

      const parsed = JSON.parse(raw);
      expect(parsed.v).toBe(2);
    });

    it('should include all fields even when null (full completeness)', () => {
      const snapshot = makeSnapshot({
        sort: null,
        filters: null,
        selectedView: null,
        aggregatedColumns: {},
      });
      const raw = encodeUrlPayload(snapshot);
      const parsed = JSON.parse(raw);

      // All fields must be present in the v2 output
      expect(parsed.v).toBe(2);
      expect('f' in parsed).toBeTrue();
      expect('sv' in parsed).toBeTrue();
      expect('pi' in parsed).toBeTrue();
      expect('ps' in parsed).toBeTrue();
      expect('ac' in parsed).toBeTrue();
      expect('so' in parsed).toBeTrue();
    });
  });
});
