import { Directive, Input, inject } from "@angular/core";
import { IbColumn } from "../kai-table/columns/column";
import type { IbDataExportProvider } from "./provider";

export type IbDataTransformerFunction = (data: unknown) => unknown;
export type IbDataTransformerInput =
  | Record<string, IbDataTransformerFunction>
  | IbDataTransformerFunction;

@Directive({
  selector: "[ibDataTransformer]",
})
export class IbDataTransformer {
  /** @ignore */
  column = inject(IbColumn);

  /**
   * The {@link ibDataTransformer} input is used to specify the data transformation functions for the column.
   * It accepts either a single function or an object containing multiple functions.
   *
   * ### Single purpose:
   *
   * If a single function is provided, it will be assigned to the default transformation function for all formats
   * If {@link ibDataTransformerFor} is provided, the transformation function will be assigned only to the specified format.
   * 
   * *Example:*
   * 
   * ```typescript
   * // example.component.ts
   * uppercaseTransformer = (name: string) => name.toUpperCase()
   * ```
   *
   * ```html
   * <!-- example.component.html -->
   * <ib-text-column name="name" [ibDataTransformer]="uppercaseTransformer"></ib-text-column>
   * ```
   *
   * ### Multiple formats:
   *
   * If an object is provided, where keys represent {@link IbDataExportProvider.format file formats names}
   * and values are functions, each function will be assigned to the corresponding format.
   * 
   * ```html
   * <ib-date-column name="created_at" sort [ibDataTransformer]="{
   *   pdf: dateToReadableFormat,
   *   xlsx: dateToSeconds,
   *   csv: dateToAnotherFormat,
   * }"></ib-date-column>
    ```
   */
  @Input() set ibDataTransformer(t: IbDataTransformerInput) {
    if (typeof t === "function") {
      this.column[`transform`] = {
        [this.ibDataTransformerFor]: t,
      };
      return;
    }

    this.column[`transform`] = t;
  }

  /**
   * The ibDataTransformerFor input is used to specify the name of the format for which
   * the data transformation functions should be applied.
   */
  @Input() ibDataTransformerFor = "ibAny";
}
