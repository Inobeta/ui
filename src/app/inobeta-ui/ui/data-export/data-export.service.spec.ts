import { CommonModule } from "@angular/common";
import { Component, Type } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { Subject } from "rxjs";
import { TranslateModule } from "@ngx-translate/core";
import { IbColumn } from "../kai-table/columns/column";
import { IbDataSourceCapability } from "../kai-table/data-source.types";
import { IbDataExportModule } from "./data-export.module";
import {
  IbDataExportService,
  IbExportableSource,
  OVERRIDE_EXPORT_FORMATS,
} from "./data-export.service";
import { IbDataExportProvider } from "./provider";

describe("IbDataExport", () => {
  describe("with override", () => {
    let fixture: ComponentFixture<IbDataExportWithOverrideApp>;
    let service: IbDataExportService;

    beforeEach(() => {
      fixture = createComponent(IbDataExportWithOverrideApp);
      service = fixture.componentInstance.exportService;
    });

    it("should create", () => {
      expect(service).toBeTruthy();
    });

    it("should export", () => {
      const result = service.export([], "test", "ib");
      expect(result).toBeTruthy();
    });
  });

  describe("default configuration", () => {
    let fixture: ComponentFixture<IbDataExportApp>;
    let service: IbDataExportService;

    beforeEach(() => {
      fixture = createComponent(IbDataExportApp);
      service = fixture.componentInstance.exportService;
    });

    it("should create", () => {
      expect(service).toBeTruthy();
    });

    it("should export as xlsx", () => {
      const spy = spyOn(service, "export").and.callThrough();
      service.export([{ test: "123" }], "test", "xlsx");
      expect(spy).toHaveBeenCalled();
    });

    it("should export as pdf", () => {
      const spy = spyOn(service, "export").and.callThrough();
      service.export([{ test: "123" }], "test", "pdf");
      expect(spy).toHaveBeenCalled();
    });

    it("should export as csv", () => {
      const spy = spyOn(service, "export").and.callThrough();
      service.export([{ test: "123" }], "test", "csv");
      expect(spy).toHaveBeenCalled();
    });

    it("should export as csv (IE 10+)", () => {
      const msSaveBlobSpy = jasmine.createSpy("msSaveBlob");
      navigator.msSaveBlob = msSaveBlobSpy;
      const spy = spyOn(service, "export").and.callThrough();
      service.export([{ test: "123" }], "test", "csv");
      expect(spy).toHaveBeenCalled();
      expect(msSaveBlobSpy).toHaveBeenCalled();
    });
  });

  describe("_exportFromTable", () => {
    let service: IbDataExportService;
    let exportSpy: jasmine.Spy;

    /** Full capabilities — for local data source tests. */
    const FULL_CAPS = new Set([
      IbDataSourceCapability.FullExport,
      IbDataSourceCapability.RowSelection,
      IbDataSourceCapability.CurrentPageExport,
    ]);

    /** Helper: create a mock sort state with a comparison function. */
    function createSortState(
      active: string,
      direction: "asc" | "desc" | ""
    ): MatSort {
      return {
        active,
        direction,
        initialized: new Subject<void>(),
        sortChange: new Subject<Sort>(),
        start: "asc",
        disabled: false,
        sortables: new Map(),
        register: () => {},
        deregister: () => {},
        sort: (sortable) => {},
        _stateChanges: new Subject<void>(),
      } as unknown as MatSort;
    }

    /** Helper: create a mock paginator at a given page. */
    function createPaginatorState(
      pageIndex: number,
      pageSize: number
    ): MatPaginator {
      return {
        pageIndex,
        pageSize,
        length: 0,
        page: new Subject<PageEvent>(),
        initialized: new Subject<void>(),
        pageSizeOptions: [10, 20, 50],
        showFirstLastButtons: false,
        hidePageSize: false,
        hasNextPage: () => false,
        hasPreviousPage: () => false,
        firstPage: () => {},
        lastPage: () => {},
        nextPage: () => {},
        previousPage: () => {},
      } as unknown as MatPaginator;
    }

    /** Helper: create a mock IbColumn. */
    function createColumn(
      name: string,
      headerText: string,
      dataAccessor?: (data: unknown, name: string) => unknown,
      transforms?: Record<string, (data: unknown) => unknown>
    ): IbColumn<unknown> {
      return {
        name: () => name,
        headerText: () => headerText,
        dataAccessor: () =>
          dataAccessor ??
          ((row: unknown, colName: string) =>
            (row as Record<string, unknown>)[colName]),
        sortingDataAccessor: () => undefined,
        filterDataAccessor: () => undefined,
        ["transform"]: transforms ?? undefined,
      } as unknown as IbColumn<unknown>;
    }

    beforeEach(() => {
      // Use a fixture-less service by creating one with the module's providers
      TestBed.configureTestingModule({
        imports: [IbDataExportModule, TranslateModule.forRoot()],
      });
      service = TestBed.inject(IbDataExportService);
      exportSpy = spyOn(service, "export").and.stub();
    });

    it("exports all filtered data with sort applied", () => {
      const data = [
        { name: "zara", age: 30 },
        { name: "alice", age: 25 },
        { name: "bob", age: 35 },
      ];

      const sort = createSortState("name", "asc");
      const columns = [createColumn("name", "Name")];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort,
        sortData: (
          rows: unknown[],
          s: MatSort
        ): unknown[] => {
          return [...rows].sort((a: any, b: any) =>
            a.name > b.name ? 1 : -1
          );
        },
        paginator: null,
        sortedColumns: columns,
        capabilities: FULL_CAPS,
      };

      service._exportFromTable("test", dataSource, {
        format: "xlsx",
        dataset: "all",
      });

      expect(exportSpy).toHaveBeenCalledTimes(1);
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      // Sorted ascending by name
      expect(exportedData[0]["Name"]).toBe("alice");
      expect(exportedData[1]["Name"]).toBe("bob");
      expect(exportedData[2]["Name"]).toBe("zara");
      expect(exportSpy.calls.mostRecent().args[1]).toBe("test");
      expect(exportSpy.calls.mostRecent().args[2]).toBe("xlsx");
    });

    it("exports all filtered data when no sort is set", () => {
      const data = [
        { name: "zara" },
        { name: "alice" },
        { name: "bob" },
      ];
      const columns = [createColumn("name", "Name")];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort: null,
        sortData: jasmine.createSpy("sortData"),
        paginator: null,
        sortedColumns: columns,
        capabilities: FULL_CAPS,
      };

      service._exportFromTable("test", dataSource, {
        format: "csv",
        dataset: "all",
      });

      expect(exportSpy).toHaveBeenCalledTimes(1);
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      // No sort applied, data order preserved
      expect(exportedData.length).toBe(3);
      expect(exportedData[0]["Name"]).toBe("zara");
      expect(exportSpy.calls.mostRecent().args[2]).toBe("csv");
    });

    it("exports current page data using paginator indexes", () => {
      const data = [
        { name: "a" },
        { name: "b" },
        { name: "c" },
        { name: "d" },
        { name: "e" },
      ];
      const paginator = createPaginatorState(1, 2); // page 1, size 2 → rows at index 2,3
      const columns = [createColumn("name", "Name")];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort: null,
        paginator,
        sortedColumns: columns,
        sortData: jasmine.createSpy("sortData"),
        capabilities: FULL_CAPS,
      };

      service._exportFromTable("test", dataSource, {
        format: "xlsx",
        dataset: "current",
      });

      expect(exportSpy).toHaveBeenCalledTimes(1);
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      expect(exportedData.length).toBe(2);
      expect(exportedData[0]["Name"]).toBe("c");
      expect(exportedData[1]["Name"]).toBe("d");
    });

    it("exports current page with sort applied before slicing", () => {
      const data = [
        { name: "delta" },
        { name: "alpha" },
        { name: "charlie" },
        { name: "bravo" },
      ];
      const sort = createSortState("name", "asc");
      const paginator = createPaginatorState(0, 2); // first 2 after sort
      const columns = [createColumn("name", "Name")];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort,
        sortData: (rows: unknown[], s: MatSort) =>
          [...rows].sort((a: any, b: any) =>
            a.name > b.name ? 1 : -1
          ),
        paginator,
        sortedColumns: columns,
        capabilities: FULL_CAPS,
      };

      service._exportFromTable("test", dataSource, {
        format: "xlsx",
        dataset: "current",
      });

      expect(exportSpy).toHaveBeenCalledTimes(1);
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      // Sorted: alpha, bravo, charlie, delta → page 0 size 2 → alpha, bravo
      expect(exportedData.length).toBe(2);
      expect(exportedData[0]["Name"]).toBe("alpha");
      expect(exportedData[1]["Name"]).toBe("bravo");
    });

    it("exports selected rows from selection column with sort", () => {
      const allData = [
        { name: "alice" },
        { name: "bob" },
        { name: "zara" },
      ];
      const selected = [allData[2], allData[0]]; // zara, alice
      const sort = createSortState("name", "asc");
      const columns = [createColumn("name", "Name")];
      const dataSource: IbExportableSource = {
        filteredData: allData,
        sort,
        sortData: (rows: unknown[], s: MatSort) =>
          [...rows].sort((a: any, b: any) =>
            a.name > b.name ? 1 : -1
          ),
        paginator: null,
        sortedColumns: columns,
        capabilities: FULL_CAPS,
      };

      service._exportFromTable("test", dataSource, {
        format: "csv",
        dataset: "selected",
      }, selected);

      expect(exportSpy).toHaveBeenCalledTimes(1);
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      // Selected: [zara, alice]; sorted asc → alice, zara
      expect(exportedData.length).toBe(2);
      expect(exportedData[0]["Name"]).toBe("alice");
      expect(exportedData[1]["Name"]).toBe("zara");
    });

    it("rejects selected dataset when selectedRows is empty", () => {
      const data = [{ name: "alice" }];
      const sort = createSortState("name", "asc");
      const columns = [createColumn("name", "Name")];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort,
        sortData: (rows: unknown[], s: MatSort) => [...rows],
        paginator: null,
        sortedColumns: columns,
        capabilities: FULL_CAPS,
      };

      expect(() => {
        service._exportFromTable("test", dataSource, {
          format: "xlsx",
          dataset: "selected",
        });
      }).toThrowError(/dataset "selected" requires non-empty selectedRows/);
    });

    it("removes ib- columns from export output", () => {
      const data = [{ name: "alice" }];
      const columns = [
        createColumn("name", "Name"),
        createColumn("ib-action", ""),
        createColumn("ib-selection", ""),
      ];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort: null,
        paginator: null,
        sortedColumns: columns,
        sortData: jasmine.createSpy("sortData"),
        capabilities: FULL_CAPS,
      };

      service._exportFromTable("test", dataSource, {
        format: "pdf",
        dataset: "all",
      });

      expect(exportSpy).toHaveBeenCalledTimes(1);
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      expect(exportedData.length).toBe(1);
      const keys = Object.keys(exportedData[0]);
      expect(keys).toEqual(["Name"]);
      expect(keys).not.toContain("");
    });

    it("applies column transforms for the target format", () => {
      const data = [{ value: 100 }];
      const xlsxTransform = jasmine
        .createSpy("xlsxTransform")
        .and.returnValue("xlsx-formatted");
      const pdfTransform = jasmine
        .createSpy("pdfTransform")
        .and.returnValue("pdf-formatted");
      const columns = [
        createColumn("value", "Value", undefined, {
          xlsx: xlsxTransform,
          pdf: pdfTransform,
        }),
      ];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort: null,
        paginator: null,
        sortedColumns: columns,
        sortData: jasmine.createSpy("sortData"),
        capabilities: FULL_CAPS,
      };

      service._exportFromTable("test", dataSource, {
        format: "xlsx",
        dataset: "all",
      });

      expect(xlsxTransform).toHaveBeenCalledWith(100);
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      expect(exportedData[0]["Value"]).toBe("xlsx-formatted");
    });

    it("uses ibAny transform as fallback when format-specific transform is missing", () => {
      const data = [{ value: 42 }];
      const anyTransform = jasmine
        .createSpy("anyTransform")
        .and.returnValue("any-formatted");
      const columns = [
        createColumn("value", "Value", undefined, {
          ibAny: anyTransform,
        }),
      ];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort: null,
        paginator: null,
        sortedColumns: columns,
        sortData: jasmine.createSpy("sortData"),
        capabilities: FULL_CAPS,
      };

      // Request csv format; column only has ibAny → should fall back
      service._exportFromTable("test", dataSource, {
        format: "csv",
        dataset: "all",
      });

      expect(anyTransform).toHaveBeenCalledWith(42);
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      expect(exportedData[0]["Value"]).toBe("any-formatted");
    });

    it("falls through to original value when no transform is defined", () => {
      const data = [{ value: 99 }];
      const columns = [createColumn("value", "Value")];
      const dataSource: IbExportableSource = {
        filteredData: data,
        sort: null,
        paginator: null,
        sortedColumns: columns,
        sortData: jasmine.createSpy("sortData"),
        capabilities: FULL_CAPS,
      };

      service._exportFromTable("test", dataSource, {
        format: "xlsx",
        dataset: "all",
      });

      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<
        string,
        unknown
      >[];
      expect(exportedData[0]["Value"]).toBe(99);
    });

    it("rejects full export when source lacks FullExport capability", () => {
      // Simulate a remote data source that only supports current-page export.
      const columns = [createColumn("id", "ID")];
      const dataSource: IbExportableSource = {
        filteredData: [],
        sort: null,
        paginator: null,
        sortedColumns: columns,
        sortData: jasmine.createSpy("sortData"),
        capabilities: new Set([IbDataSourceCapability.CurrentPageExport]),
      };

      expect(() => {
        service._exportFromTable("test", dataSource, {
          format: "xlsx",
          dataset: "all",
        });
      }).toThrowError(/dataset "all" requires the "fullExport" capability/);
    });

    it("rejects selected export when source lacks RowSelection capability", () => {
      const columns = [createColumn("id", "ID")];
      const dataSource: IbExportableSource = {
        filteredData: [],
        sort: null,
        paginator: null,
        sortedColumns: columns,
        sortData: jasmine.createSpy("sortData"),
        capabilities: new Set(),
      };

      expect(() => {
        service._exportFromTable("test", dataSource, {
          format: "xlsx",
          dataset: "selected",
        }, [{ id: 1 }]);
      }).toThrowError(/dataset "selected" requires the "rowSelection" capability/);
    });

    it("rejects current-page export when source lacks CurrentPageExport capability", () => {
      const columns = [createColumn("id", "ID")];
      const dataSource: IbExportableSource = {
        filteredData: [],
        sort: null,
        paginator: null,
        sortedColumns: columns,
        sortData: jasmine.createSpy("sortData"),
        capabilities: new Set(),
      };

      expect(() => {
        service._exportFromTable("test", dataSource, {
          format: "xlsx",
          dataset: "current",
        });
      }).toThrowError(/dataset "current" requires the "currentPageExport" capability/);
    });
  });
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [type],
    imports: [CommonModule, IbDataExportModule, TranslateModule.forRoot()],
  }).compileComponents();
}

function createComponent<T>(type: Type<T>): ComponentFixture<T> {
  configureModule(type);

  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

export const createDataExportComponent = createComponent;

class IbStubExportProvider implements IbDataExportProvider {
  format = "ib";
  label = "inobeta";
  export(data: any[], filename: string): boolean {
    return true;
  }
}

@Component({
    template: ``,
    providers: [
        IbDataExportService,
        {
            provide: OVERRIDE_EXPORT_FORMATS,
            useClass: IbStubExportProvider,
            multi: true,
        },
    ],
    standalone: false
})
class IbDataExportWithOverrideApp {
  constructor(public exportService: IbDataExportService) {}
}

@Component({
    template: ``,
    standalone: false
})
class IbDataExportApp {
  constructor(public exportService: IbDataExportService) {}
}
