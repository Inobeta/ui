import { ActivatedRoute, Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { IbFilterSyntaxExtended } from '../kai-filter/filter.types';
import { Sort } from '@angular/material/sort';
import { IbKaiTableParams } from './store/url-state/interfaces';
import { DEFAULT_VIEW_ID } from '../views/view.types';


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

  getRawParams(tableName: string): IbTableQsParams {
    return JSON.parse(this.activatedRoute.snapshot.queryParams?.[tableName]
      ?? `{"ibfilter": ${JSON.stringify(this.emptyFilterSchema[tableName] ?? {})}, "ibpage": 0, "ibpagesize": 20, "ibaggregatedcolumns": {}, "ibsort": {}  }`) ?? {};
  }


  getFilters(tableName: string): IbFilterSyntaxExtended {
    return this.getRawParams(tableName).ibfilter ?? {};
  }

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

  getPaginator(tableName: string): { pageIndex: number, pageSize: number } {
    return {
      pageIndex: this.getRawParams(tableName).ibpage ?? 0,
      pageSize: this.getRawParams(tableName).ibpagesize ?? 0,
    }
  }

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

  getAggregatedColumns(tableName: string) {
    return this.getRawParams(tableName).ibaggregatedcolumns ?? {};
  }

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

  getSort(tableName: string): Sort {
    return this.getRawParams(tableName).ibsort ?? { active: '', direction: '' };
  }

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

  getActiveView(tableName: string): string | null {
    return this.getRawParams(tableName).ibview ?? null;
  }

  setActiveView(tableName: string, viewId: string): void {
    const raw = this.getRawParams(tableName);
    const payload = viewId === DEFAULT_VIEW_ID
      ? { ...raw }
      : { ...raw, ibview: viewId };

    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify(payload)
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setViewState(tableName: string, viewId: string, params: Partial<IbTableQsParams>): void {
    const raw = this.getRawParams(tableName);
    const payload = viewId === DEFAULT_VIEW_ID
      ? { ...raw, ...params }
      : { ...raw, ...params, ibview: viewId };

    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify(payload)
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}


export type IbTableQsParams = {
  ibpage: number;
  ibpagesize: number;
  ibfilter: IbFilterSyntaxExtended;
  ibaggregatedcolumns: Record<string, string>;
  ibsort: Sort;
  ibview?: string;
}
