import { ActivatedRoute, Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { IbFilterSyntaxExtended } from '../kai-filter/filter.types';
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
}
