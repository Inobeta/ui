import { inject, Provider } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { IB_TABLE } from "../tokens";

export const IB_COLUMN_MAT_SORT_PROVIDER: Provider = {
  provide: MatSort,
  useFactory: () => inject(IB_TABLE, { optional: true })?.sort() ?? new MatSort(),
};
