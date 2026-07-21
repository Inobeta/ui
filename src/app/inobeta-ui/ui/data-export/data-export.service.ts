import { Inject, Injectable, InjectionToken } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { IbColumn } from "../kai-table/columns/column";
import { IbDataSourceCapability } from "../kai-table/data-source.types";
import { IbDataExportProvider } from "./provider";
import {
  IbTableDataExportDialog,
  IbTableDataExportDialogData,
} from "./table-data-export-dialog.component";

export interface IDataExportSettings {
  format: "xlsx" | "pdf" | "csv";
  dataset: "all" | "selected" | "current";
}

export const OVERRIDE_EXPORT_FORMATS = new InjectionToken<IbDataExportProvider>(
  "overrideExportFormats"
);

/**
 * Minimal contract required by {@link IbDataExportService._exportFromTable}.
 *
 * Data sources (local, remote, or compatibility wrappers) that support
 * table-driven export must satisfy this shape.  Capabilities are used to
 * validate the requested dataset before extraction begins.
 */
export interface IbExportableSource {
  /** Current filtered and sorted rows visible in the table. */
  filteredData: unknown[];
  /** Active sort control, or `null`. */
  sort: MatSort | null;
  /** Sort implementation — may be overridden by consumers. */
  sortData: (data: unknown[], sort: MatSort) => unknown[];
  /** Active paginator control, or `null`. */
  paginator: MatPaginator | null;
  /** Columns rendered in the table, in display order. */
  sortedColumns: IbColumn<unknown>[];
  /** Data-source capabilities declared by the owning source.
   * When omitted, capability validation is skipped (backward compat). */
  capabilities?: ReadonlySet<IbDataSourceCapability>;
}

@Injectable({ providedIn: "root" })
export class IbDataExportService {
  formats: any;

  constructor(
    private dialog: MatDialog,
    @Inject(OVERRIDE_EXPORT_FORMATS) private providers: IbDataExportProvider[]
  ) {
    this.formats = this.providers.map((p) => ({
      value: p.format,
      label: p.label,
    }));
  }

  openExportDialog(data: Partial<IbTableDataExportDialogData>) {
    return this.dialog
      .open(IbTableDataExportDialog, {
        width: "350px",
        data: {
          ...data,
          formats: this.formats,
        },
      })
      .afterClosed();
  }

  /**
   * Internal use for IbTable
   *
   * @ignore
   */
  _exportFromTable(
    tableName: string,
    dataSource: IbExportableSource,
    settings: IDataExportSettings,
    selectedRows?: unknown[],
  ) {
    this._assertExportCapability(dataSource, settings.dataset, selectedRows);

    let data: unknown[];

    if (settings.dataset === "all") {
      data = [...dataSource.filteredData];
      const sort = dataSource.sort;
      if (sort) {
        data = dataSource.sortData(data, sort);
      }
    }

    if (settings.dataset === "selected") {
      data = selectedRows ?? [];
      const sort = dataSource.sort;
      if (sort) {
        data = dataSource.sortData(data, sort);
      }
    }

    if (settings.dataset === "current") {
      let ordered = [...dataSource.filteredData];
      const sort = dataSource.sort;
      if (sort) {
        ordered = dataSource.sortData(ordered, sort);
      }
      const pageIndex = dataSource.paginator?.pageIndex ?? 0;
      const pageSize = dataSource.paginator?.pageSize ?? ordered.length;
      data = ordered.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    }

    const columns = dataSource.sortedColumns.filter(
      (c) => !c.name().startsWith("ib-")
    );

    const dataAccessor = this.getDataAccessorForFormat(settings.format);

    const output = data.map((row) =>
      columns.reduce(
        (acc, column) => ({
          ...acc,
          [column.headerText()]: dataAccessor(row, column),
        }),
        {}
      )
    );

    this.export(output, tableName, settings.format);
  }

  /**
   *
   * @param data Array of object to export
   * @param filename Name of the output file
   * @param format Output file format. By default, only `xlsx`, `pdf`, and `csv` are supported
   */
  export(data: any[], filename: string, format: string) {
    const provider = this.providers.find((p) => p.format === format);
    return provider.export(data, filename);
  }

  /**
   * Validates that the requested dataset is supported by the source's
   * declared capabilities.  Throws when the operation is unsupported.
   */
  private _assertExportCapability(
    source: IbExportableSource,
    dataset: IDataExportSettings["dataset"],
    selectedRows?: unknown[],
  ): void {
    const caps = source.capabilities;
    if (!caps) return; // backward compat — no capability contract declared

    if (dataset === "current" && !caps.has(IbDataSourceCapability.CurrentPageExport)) {
      throw new Error(
        `IbDataExportService: dataset "current" requires the ` +
        `"${IbDataSourceCapability.CurrentPageExport}" capability.`
      );
    }

    if (dataset === "selected") {
      if (!caps.has(IbDataSourceCapability.RowSelection)) {
        throw new Error(
          `IbDataExportService: dataset "selected" requires the ` +
          `"${IbDataSourceCapability.RowSelection}" capability.`
        );
      }
      if (!selectedRows || selectedRows.length === 0) {
        throw new Error(
          `IbDataExportService: dataset "selected" requires non-empty ` +
          `selectedRows from the caller.`
        );
      }
    }

    if (dataset === "all" && !caps.has(IbDataSourceCapability.FullExport)) {
      throw new Error(
        `IbDataExportService: dataset "all" requires the ` +
        `"${IbDataSourceCapability.FullExport}" capability.`
      );
    }
  }

  /** @ignore */
  private getDataAccessorForFormat =
    (format: string) => (row: unknown, column: IbColumn<unknown>) => {
      const accessor = column.dataAccessor();
      const colName = column.name();
      const data = accessor ? accessor(row, colName) : (row as Record<string, unknown>)[colName];
      const fn =
        column?.["transform"]?.[format] ?? column?.["transform"]?.["ibAny"];
      if (!fn) {
        return data;
      }
      return fn(data);
    };
}
