import { ActivatedRoute, Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { IbFilterSyntaxExtended } from '../kai-filter/filter.types';
import { Sort } from '@angular/material/sort';
import { IbKaiTableParams } from './store/url-state/interfaces';
import {
  IbKaiTableSnapshot,
  IbKaiTableUrlParams,
} from './table.types';
import { decodeUrlPayload, encodeUrlPayload } from './table-url-codec';


@Injectable({ providedIn: 'root' })
export class IbTableUrlService {
  _emptyFilterSchema: Record<string, IbFilterSyntaxExtended> = {};

  get emptyFilterSchema() {
    return this._emptyFilterSchema;
  }
  set emptyFilterSchema(value) {
    this._emptyFilterSchema = value;
  }

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  constructor() { }

  // =========================================================================
  // NEW Canonical API (DEVK-1066)
  // =========================================================================

  /**
   * Decodes the query-param value for `tableName` using the v2 / legacy
   * codec.  Returns a patch with presence info distinguishing absent keys
   * from keys present with `null`.  Returns `null` when no URL state
   * exists for this table.
   */
  decodeUrlParams(tableName: string): IbKaiTableUrlParams | null {
    const raw = this.activatedRoute.snapshot.queryParams?.[tableName];
    return decodeUrlPayload(raw);
  }

  /**
   * Writes the full table state as a v2 JSON payload into the URL
   * query string, using `replaceUrl: true` so no history entry is
   * created.
   *
   * Other query params and other tables are preserved via
   * `queryParamsHandling: 'merge'`.
   */
  writeState(tableName: string, snapshot: IbKaiTableSnapshot): void {
    const payload = encodeUrlPayload(snapshot);
    this.router.navigate([], {
      queryParams: {
        [tableName]: payload,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // =========================================================================
  // LEGACY API — kept for backward compatibility
  // =========================================================================

  /**
   * @deprecated Use {@link decodeUrlParams} instead.
   */
  getRawParams(tableName: string): IbTableQsParams {
    return JSON.parse(this.activatedRoute.snapshot.queryParams?.[tableName]
      ?? `{"ibfilter": ${JSON.stringify(this.emptyFilterSchema[tableName] ?? {})}, "ibview": "__ibTableView__all", "ibpage": 0, "ibpagesize": 20, "ibaggregatedcolumns": {}, "ibsort": {}  }`) ?? {};
  }

  /**
   * @deprecated Use the canonical store selectors instead.
   */
  getFilters(tableName: string): IbFilterSyntaxExtended {
    return this.getRawParams(tableName).ibfilter ?? {};
  }

  /**
   * @deprecated Use {@link writeState} via the canonical effect instead.
   */
  setFilters(tableName: string, params: IbFilterSyntaxExtended) {
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibfilter: params
        })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * @deprecated Use the canonical store selectors instead.
   */
  getActiveView(tableName: string,): string {
    return this.getRawParams(tableName).ibview ?? '__ibTableView__all';
  }

  /**
   * @deprecated Use {@link writeState} via the canonical effect instead.
   */
  setPaginator(tableName: string, params: { pageIndex: number, pageSize: number }) {
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibpage: params.pageIndex,
          ibpagesize: params.pageSize,
        })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * @deprecated Use the canonical store selectors instead.
   */
  getPaginator(tableName: string): { pageIndex: number, pageSize: number } {
    return {
      pageIndex: this.getRawParams(tableName).ibpage ?? 0,
      pageSize: this.getRawParams(tableName).ibpagesize ?? 0,
    }
  }

  /**
   * @deprecated Use {@link writeState} via the canonical effect instead.
   */
  setAggregatedColumns(tableName: string, params: Record<string, string>) {
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibaggregatedcolumns: params
        })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * @deprecated Use the canonical store selectors instead.
   */
  getAggregatedColumns(tableName: string) {
    return this.getRawParams(tableName).ibaggregatedcolumns ?? {};
  }

  /**
   * @deprecated Use {@link writeState} via the canonical effect instead.
   */
  setSort(tableName: string, params: Sort) {
    const ibsort = params.direction !== '' ? params : null
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibsort
        })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * @deprecated Use the canonical store selectors instead.
   */
  getSort(tableName: string): Sort {
    return this.getRawParams(tableName).ibsort ?? { active: '', direction: '' };
  }

  /**
   * @deprecated Use {@link writeState} via the canonical effect instead.
   */
  handleViewChange(tableName: string, params: Omit<IbKaiTableParams, 'tableName'> & { view: string }) {
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibview: params.view,
          ibpage: params.page,
          ibpagesize: params.pageSize,
          ibfilter: params.filters,
          ibaggregatedcolumns: params.aggregatedColumns,
          ibsort: params.sort,
        })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * @deprecated Use the canonical store selectors instead.
   */
  getViewState(tableName: string) {
    return {
      view: this.getActiveView(tableName),
      pageSize: this.getPaginator(tableName).pageSize,
      page: this.getPaginator(tableName).pageIndex,
      filters: this.getFilters(tableName),
      aggregatedColumns: this.getAggregatedColumns(tableName),
      sort: this.getSort(tableName)
    }
  }

  /**
   * @deprecated Use {@link writeState} via the canonical effect instead.
   */
  setFilterAndSort(tableName: string, ibfilter: IbFilterSyntaxExtended, sort: Sort) {
    const ibsort = sort.direction !== '' ? sort : null
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibfilter,
          ibsort
        })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

/**
 * @deprecated Use {@link IbKaiTableUrlParams} from the v2 codec instead.
 */
export type IbTableQsParams = {
  ibpage: number;
  ibpagesize: number;
  ibfilter: IbFilterSyntaxExtended;
  ibaggregatedcolumns: Record<string, string>;
  ibsort: Sort;
  ibview: string;
}
