import { ActivatedRoute, Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { IbFilterSyntaxExtended } from '../kai-filter/filter.types';
import { Sort } from '@angular/material/sort';
import { IbKaiTableParams } from './store/url-state/interfaces';


@Injectable({providedIn: 'root'})
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
      ?? `{"ibfilter": ${JSON.stringify(this.emptyFilterSchema[tableName] ?? {})}, "ibview": "__ibTableView__all", "ibpage": 0, "ibpagesize": 10, "ibaggregatedcolumns": {}, "ibsort": {}  }`) ?? {};
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
    });
  }

  getActiveView(tableName: string,) : string{
    return this.getRawParams(tableName).ibview ?? '__ibTableView__all';
  }

  setPaginator(tableName: string, params: {pageIndex: number, pageSize: number}) {
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibpage: params.pageIndex,
          ibpagesize: params.pageSize,
        })
      },
      queryParamsHandling: 'merge',
    });
  }

  getPaginator(tableName: string) : {pageIndex: number, pageSize: number}{
    return {
      pageIndex: this.getRawParams(tableName).ibpage ?? 0,
      pageSize: this.getRawParams(tableName).ibpagesize ?? 0,
    }
  }

  setAggregatedColumns(tableName: string,params: Record<string, string>) {
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibaggregatedcolumns: params
        })
      },
      queryParamsHandling: 'merge',
    });
  }

  getAggregatedColumns(tableName: string) {
    return this.getRawParams(tableName).ibaggregatedcolumns ?? {};
  }

  setSort(tableName: string,params: Sort) {
    const ibsort = params.direction !== '' ? params : null
    this.router.navigate([], {
      queryParams: {
        [tableName]: JSON.stringify({
          ...this.getRawParams(tableName),
          ibsort
        })
      },
      queryParamsHandling: 'merge',
    });
  }

  getSort(tableName: string) : Sort{
    return this.getRawParams(tableName).ibsort ?? {active: '', direction: ''};
  }

  handleViewChange(tableName: string,params: Omit<IbKaiTableParams, 'tableName'> & {view: string}) {
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
    });
  }


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
    });
  }
}


export type IbTableQsParams = {
  ibpage: number;
  ibpagesize: number;
  ibfilter: IbFilterSyntaxExtended;
  ibaggregatedcolumns: Record<string, string>;
  ibsort: Sort;
  ibview: string;
}
