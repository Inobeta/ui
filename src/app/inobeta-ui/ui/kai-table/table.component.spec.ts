import { ComponentPortal } from "@angular/cdk/portal";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule, registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import { Component, Injectable, Type, ChangeDetectionStrategy } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from "@angular/core/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { MatRadioButtonHarness } from "@angular/material/radio/testing";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSortModule, Sort } from "@angular/material/sort";
import { MatSortHarness } from "@angular/material/sort/testing";
import { MatTableHarness } from "@angular/material/table/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { provideStore } from "@ngrx/store";
import { Store } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { Observable, map, of, throwError, timer } from "rxjs";
import {
  IbDataExportModule,
  IbDataExportService,
  IbExportableSource,
  IDataExportSettings,
  OVERRIDE_EXPORT_FORMATS
} from "../data-export";
import { IbColumn } from "./columns/column";
import { IbDataExportProvider } from "../data-export/provider";
import { IbFilterModule, IbSearchBar, IbTagFilter } from "../kai-filter";
import { IbTableActionModule } from "./action";
import { IbTableViewsHost } from "./table-views-host";
import { IbTableViewsHostStub } from "./table-views-host.stub.spec";
import { IbAggregate, IbAggregateCell } from "./cells";
import {
  IbFetchDataResponse,
  IbRemoteDataSourceRequest,
  IbTableRemoteDataSource,
} from "./remote-data-source";
import { tableStateActions } from "./store/url-state/actions";
import { IbTableUrlService } from "./table-url.service";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";
import { IbTableLocalDataSource } from "./local-data-source";
import { IbKaiTableStateFacade } from "./table-state.facade";
import { IB_AGGREGATE } from "./tokens";

// Locale registration required by DecimalPipe / DatePipe in columns
registerLocaleData(localeIt);

interface IbNamedRow {
  name: string;
}

interface IbExportRow extends IbNamedRow {
  color: string;
}

interface IbExportTransformerRow extends IbNamedRow {
  created_at: Date;
  updated_at: Date;
}

describe("IbTable", () => {
  describe("with IbRemoteTableDataSource", () => {
    it("should create", fakeAsync(() => {
      const fixture = createComponent(IbTableWithRemoteDataApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      tick(1000);
      const remoteSource = component.activeDataSource() as IbTableRemoteDataSource<any>;
      expect(component).toBeTruthy();
      expect(remoteSource.state).toBe("idle");
    }));

    it("should show error on exception", fakeAsync(() => {
      const fixture = createComponent(IbTableWithRemoteDataApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      const remoteDs = fixture.componentInstance.dataSource;
      remoteDs.fetchData = () =>
        throwError(() => new Error("test-error"));
      const source = component.activeDataSource();
      if ('refresh' in source) {
        source.refresh();
      }
      tick(500);
      fixture.detectChanges();
      expect(component.effectiveState()).toBe("http_error");
    }));

    it("should update the paginator length from the remote total count", fakeAsync(() => {
      const fixture = createComponent(IbTableWithRemoteDataApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;

      tick(1000);
      fixture.detectChanges();
      fixture.componentInstance.dataSource.refresh();
      tick(1000);

      expect(component.paginator().length).toBe(1);
    }));

    it("should not export a remote data source", () => {
      const fixture = createComponent(IbTableWithRemoteDataApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      const exportSpy = spyOn(component.exportService, "_exportFromTable");

      component.doExport({ format: "csv", dataset: "all" });

      expect(exportSpy).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Export capability gating — DEVK-1105
  // ===========================================================================

  describe("export capability gating (DEVK-1105)", () => {
    describe("with a remote data source", () => {
      it("offers only the current-page dataset in the export dialog", async () => {
        const fixture = createComponent(IbTableWithRemoteExportApp);
        const component = fixture.debugElement.query(
          By.directive(IbTable)
        ).componentInstance as IbTable;
        await fixture.whenStable();
        fixture.detectChanges();
        component.setPaginatorState({ pageIndex: 0, pageSize: 2 });
        await fixture.whenStable();
        fixture.detectChanges();
        const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);

        const exportButton = await loader.getHarness(
          MatButtonHarness.with({
            ancestor: ".ib-table__toolbar__actions",
          })
        );
        await exportButton.click();
        const dialog = await loader.getHarness(MatDialogHarness);
        fixture.detectChanges();
        await fixture.whenStable();

        const radios = await dialog.getAllHarnesses(MatRadioButtonHarness);
        expect(radios.length).toBe(1);
        expect(await radios[0].getValue()).toBe("current");
      });

      it("exports the already loaded page and performs no extra fetch", fakeAsync(() => {
        const fixture = createComponent(IbTableWithRemoteExportApp);
        const component = fixture.debugElement.query(
          By.directive(IbTable)
        ).componentInstance as IbTable;
        const remoteDs = fixture.componentInstance.dataSource;
        const fetchSpy = spyOn(remoteDs, "fetchData").and.callThrough();
        const exportServiceSpy = spyOn(
          component.exportService,
          "_exportFromTable"
        );

        tick(1000);
        fixture.detectChanges();
        component.setPaginatorState({ pageIndex: 0, pageSize: 2 });
        tick(1000);
        fixture.detectChanges();
        fetchSpy.calls.reset();
        const fetchCallsBefore = fetchSpy.calls.count();

        component.doExport({ format: "csv", dataset: "current" });

        expect(fetchSpy.calls.count()).toBe(fetchCallsBefore);
        const exportCall = exportServiceSpy.calls.mostRecent();
        expect(exportCall.args[0]).toBe("test-remote-export");
        expect(exportCall.args[2]).toEqual({ format: "csv", dataset: "current" });
        const sourceArg = exportCall.args[1] as IbExportableSource;
        expect(sourceArg.filteredData).toEqual([
          { name: "alice" },
          { name: "bob" },
        ]);
      }));

      it("never sends an all-row export request to the export service", fakeAsync(() => {
        const fixture = createComponent(IbTableWithRemoteExportApp);
        const component = fixture.debugElement.query(
          By.directive(IbTable)
        ).componentInstance as IbTable;
        const exportServiceSpy = spyOn(
          component.exportService,
          "_exportFromTable"
        );

        tick(1000);
        component.doExport({ format: "csv", dataset: "all" });

        expect(exportServiceSpy).not.toHaveBeenCalled();
      }));

      it("never sends a selected-row export request to the export service", fakeAsync(() => {
        const fixture = createComponent(IbTableWithRemoteExportApp);
        const component = fixture.debugElement.query(
          By.directive(IbTable)
        ).componentInstance as IbTable;
        const exportServiceSpy = spyOn(
          component.exportService,
          "_exportFromTable"
        );

        tick(1000);
        component.doExport({ format: "csv", dataset: "selected" });

        expect(exportServiceSpy).not.toHaveBeenCalled();
      }));

      it("ignores an unknown runtime export dataset", fakeAsync(() => {
        const fixture = createComponent(IbTableWithRemoteExportApp);
        const component = fixture.debugElement.query(
          By.directive(IbTable)
        ).componentInstance as IbTable;
        const exportServiceSpy = spyOn(
          component.exportService,
          "_exportFromTable"
        ).and.callThrough();
        const malformedSettings = {
          format: "csv",
          dataset: "unknown",
        } as unknown as Partial<IDataExportSettings>;

        tick(1000);

        expect(() => component.doExport(malformedSettings)).not.toThrow();
        expect(exportServiceSpy).not.toHaveBeenCalled();
      }));
    });

    describe("with a local data source", () => {
      it("exports only the ordered page slice for a non-first page", async () => {
        const fixture = createComponent(IbTableWithLocalExportApp);
        const component = fixture.debugElement.query(
          By.directive(IbTable)
        ).componentInstance as IbTable;
        const source = component.activeDataSource() as IbTableLocalDataSource<IbNamedRow>;

        await fixture.whenStable();
        fixture.detectChanges();

        source.setColumns([createExportColumn("name", "Name")]);
        component.setPaginatorState({ pageIndex: 1, pageSize: 2 });
        await fixture.whenStable();
        fixture.detectChanges();

        const exportSpy = spyOn(component.exportService, "export");
        component.doExport({ format: "csv", dataset: "current" });

        expect(exportSpy).toHaveBeenCalledWith(
          [{ name: "c" }, { name: "d" }],
          component.tableName(),
          "csv"
        );
      });

      it("uses its custom sorter for all, current, and selected exports", async () => {
        const fixture = createComponent(IbTableWithLocalExportApp);
        const component = fixture.debugElement.query(
          By.directive(IbTable)
        ).componentInstance as IbTable;
        const source = component.activeDataSource() as IbTableLocalDataSource<{ name: string }>;

        await fixture.whenStable();
        fixture.detectChanges();

        source.setColumns([createExportColumn("name", "Name")]);
        source.sortData = (data) => data.sort((left, right) => right.name.localeCompare(left.name));
        const sort = component.sort();
        sort.active = "name";
        sort.direction = "desc";
        sort.sortChange.emit({ active: "name", direction: "desc" });
        component.setPaginatorState({ pageIndex: 1, pageSize: 2 });
        component.selectionColumn().selection.select(source.data[0], source.data[5], source.data[2]);
        await fixture.whenStable();
        fixture.detectChanges();

        const exportSpy = spyOn(component.exportService, "export");

        component.doExport({ format: "csv", dataset: "all" });
        expect(exportSpy.calls.mostRecent().args[0]).toEqual([
          { name: "f" }, { name: "e" }, { name: "d" },
          { name: "c" }, { name: "b" }, { name: "a" },
        ]);

        component.doExport({ format: "csv", dataset: "current" });
        expect(exportSpy.calls.mostRecent().args[0]).toEqual([{ name: "d" }, { name: "c" }]);

        component.doExport({ format: "csv", dataset: "selected" });
        expect(exportSpy.calls.mostRecent().args[0]).toEqual([{ name: "f" }, { name: "c" }, { name: "a" }]);
      });
    });

    it("hides selected export without a selection column", async () => {
      const noSelectionFixture = createComponent(IbTableWithExportNoSelection);
      await noSelectionFixture.whenStable();
      noSelectionFixture.detectChanges();
      const noSelectionLoader = TestbedHarnessEnvironment.documentRootLoader(noSelectionFixture);
      const exportButton = await noSelectionLoader.getHarness(
        MatButtonHarness.with({ ancestor: ".ib-table__toolbar__actions" })
      );
      await exportButton.click();
      const dialog = await noSelectionLoader.getHarness(MatDialogHarness);
      noSelectionFixture.detectChanges();
      const radios = await dialog.getAllHarnesses(MatRadioButtonHarness);
      const values = await Promise.all(radios.map((radio) => radio.getValue()));
      expect(values).not.toContain("selected");
    });

    it("shows selected export with a selection column and exports exactly its rows", async () => {
      const fixture = createComponent(IbTableWithExport);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      const exportSpy = spyOn(component.exportService, "export");
      await fixture.whenStable();
      fixture.detectChanges();

      const localSource = component.activeDataSource() as IbTableLocalDataSource<IbExportRow>;
      component.selectionColumn().selection.select(
        ...localSource.getCurrentPageData().slice(0, 2)
      );
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
      const exportButton = await loader.getHarness(
        MatButtonHarness.with({ ancestor: ".ib-table__toolbar__actions" })
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      fixture.detectChanges();
      const values = await Promise.all(
        (await dialog.getAllHarnesses(MatRadioButtonHarness)).map((radio) => radio.getValue()),
      );
      expect(values).toContain("selected");
      const selectedRadio = await dialog.getHarness(
        MatRadioButtonHarness.with({ label: "shared.ibTable.exportData.selectedRows" })
      );
      await selectedRadio.check();
      const confirm = await dialog.getHarness(
        MatButtonHarness.with({ text: "shared.ibTable.export" })
      );
      await confirm.click();
      fixture.detectChanges();

      expect(exportSpy).toHaveBeenCalled();
      const exportedData = exportSpy.calls.mostRecent().args[0] as Record<string, unknown>[];
      expect(exportedData.map((row) => row["name"])).toEqual(["alice", "rabbit"]);
    });

    it("shows current-page export when the paginator has multiple pages", async () => {
      const fixture = createComponent(IbTableWithExport);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      await fixture.whenStable();
      fixture.detectChanges();
      component.setPaginatorState({ pageIndex: 0, pageSize: 2 });
      await fixture.whenStable();
      fixture.detectChanges();
      const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
      const exportButton = await loader.getHarness(
        MatButtonHarness.with({ ancestor: ".ib-table__toolbar__actions" })
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      fixture.detectChanges();
      const radios = await dialog.getAllHarnesses(MatRadioButtonHarness);
      const values = await Promise.all(radios.map((radio) => radio.getValue()));
      expect(values).toContain("current");
    });

    it("hides current-page export after the page size changes to one page", async () => {
      const fixture = createComponent(IbTableWithExport);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      await fixture.whenStable();
      fixture.detectChanges();
      component.setPaginatorState({ pageIndex: 0, pageSize: 100 });
      await fixture.whenStable();
      fixture.detectChanges();
      const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
      const exportButton = await loader.getHarness(
        MatButtonHarness.with({ ancestor: ".ib-table__toolbar__actions" })
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      fixture.detectChanges();
      const radios = await dialog.getAllHarnesses(MatRadioButtonHarness);
      const values = await Promise.all(radios.map((radio) => radio.getValue()));
      expect(values).not.toContain("current");
    });
  });

  describe("with rowgroup", () => {
    it("should render", async () => {
      const fixture = createComponent(IbTableWithRowGroupApp);
      const rowGroup = fixture.nativeElement.querySelectorAll(
        ".ib-table__row-group"
      );
      expect(rowGroup.length).toBeTruthy();
    });
  });

  describe("with views host", () => {
    let hostFixture: ComponentFixture<IbTableWithViewGroupApp>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          IbTableWithViewGroupApp,
          IbTableWithViewGroupNoFilterApp,
          IbTestViewsHostComponent,
          IbTestViewsHostWithPortalComponent,
        ],
        imports: [
          CommonModule,
          IbKaiTableModule,
          IbTableActionModule,
          IbFilterModule,
          MatSortModule,
          IbDataExportModule,
          NoopAnimationsModule,
          TranslateModule.forRoot({
            extend: true,
          }),
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          provideStore(),
          { provide: MatSnackBar, useValue: { open: () => { } } },
          IbTableUrlService,
        ],
      }).compileComponents();
    }));

    beforeEach(async () => {
      hostFixture = TestBed.createComponent(IbTableWithViewGroupApp);
      hostFixture.detectChanges();
      component = hostFixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      loader = TestbedHarnessEnvironment.documentRootLoader(hostFixture);
    });

    it("should create with stub views host", () => {
      expect(component).toBeTruthy();
      expect(component.viewHost()).toBeTruthy();
      expect(component.viewHost() instanceof IbTableViewsHostStub).toBeTrue();
    });

    it("should initialize views host on creation", async () => {
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost() as IbTableViewsHostStub;
      expect(host.viewGroupName).toBe("test-views");
      expect(typeof host.viewDataAccessor).toBe("function");

      const data = host.viewDataAccessor();
      expect(data.filter).toBeDefined();
      expect(data.pageSize).toBeGreaterThan(0);
      expect(data.sort).toBeDefined();
      expect(data.aggregatedColumns).toBeDefined();

      expect(component.activeDataSource()).toEqual(jasmine.any(IbTableLocalDataSource));

      expect(component.actionPortals.length).toBe(1);

      const hostEl = hostFixture.debugElement.query(By.directive(IbTable));
      expect(hostEl.classes["ib-table--has-views"]).toBeTrue();
    });

    it("should apply active view changes to table state", async () => {
      const f = hostFixture;
      const c = component;
      await hostFixture.whenStable();
      f.detectChanges();

      const host = c.viewHost() as IbTableViewsHostStub;
      expect(c.activeDataSource()).toEqual(jasmine.any(IbTableLocalDataSource));

      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, "dispatch").and.callThrough();

      host.emitActiveViewChanged({
        filter: {},
        pageSize: 50,
        aggregatedColumns: { amount: "sum" },
        sort: { active: "name", direction: "asc" },
        viewId: "test-view-1",
      });

      await f.whenStable();
      f.detectChanges();

      const dispatchedAction = dispatchSpy.calls.mostRecent().args[0];
      expect(dispatchedAction).toEqual(
        tableStateActions.applyView({
          tableName: "test-views",
          selectedView: "test-view-1",
          snapshot: {
            filters: {},
            pageSize: 50,
            aggregatedColumns: { amount: "sum" },
            sort: { active: "name", direction: "asc" },
          },
        }),
      );
    });

    it("should preserve null filters when applying the Default baseline", async () => {
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost() as IbTableViewsHostStub;
      const baseline = host.defaultViewBaseline!;
      const facade = component["stateFacade"] as IbKaiTableStateFacade;
      const applyViewSpy = spyOn(facade, "applyView");

      expect(baseline.filters).toBeNull();
      expect(baseline.filter).toEqual({});

      host.emitActiveViewChanged({ ...baseline, viewId: null });

      expect(applyViewSpy).toHaveBeenCalledWith(null, {
        sort: null,
        filters: null,
        pageSize: 20,
        aggregatedColumns: {},
      });
    });

    it("should forward toolbar portals from views host", async () => {
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost() as IbTableViewsHostStub;
      const portalCount = host.toolbarPortals.length;

      expect(component.actionPortals.length).toBe(1 + portalCount);
    });

    // ===========================================================================
    // Bridge ordering — DEVK-1065 Step 7
    // ===========================================================================

    it("should call setViewGroupName before facade.initialize (resolveView is group-aware)", async () => {
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost() as IbTableViewsHostStub;
      // setViewGroupName fires synchronously before the first `await` in
      // ngAfterContentInit, so the group name is already assigned when
      // facade.initialize calls resolveView().
      expect(host.viewGroupName).toBe("test-views");
      expect(host.viewGroupNameSet).toBeTrue();
    });

    // ===========================================================================
    // Default baseline — DEVK-1065 Step 7
    // ===========================================================================

    it("should supply the Default view baseline to the views host after init", async () => {
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost() as IbTableViewsHostStub;
      expect(host.defaultViewBaseline).not.toBeNull();
      expect(host.defaultViewBaseline!.pageSize).toBeGreaterThan(0);
      expect(host.defaultViewBaseline!.sort).toBeDefined();
      // filters can be null (technical default) — it is the host's
      // responsibility to handle that.
      expect(host.defaultViewBaseline!.aggregatedColumns).toBeDefined();
    });

    it("should derive Default baseline from tableDef (not hard-coded)", async () => {
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost() as IbTableViewsHostStub;
      // IbTableWithViewGroupApp does not provide a tableDef, so the
      // baseline uses technical defaults: pageSize 20, no sort, no filters.
      const baseline = host.defaultViewBaseline!;
      expect(baseline.pageSize).toBe(20);
      expect(baseline.filters).toBeNull();
      expect(baseline.sort).toEqual({ active: '', direction: '' });
      expect(baseline.aggregatedColumns).toEqual({});
    });

    // ===========================================================================
    // Canonical sync without feedback — DEVK-1065 Step 7
    // ===========================================================================

    it("should sync the host to canonical selectedView without emitting activeViewChanged", async () => {
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost() as IbTableViewsHostStub;
      // syncActiveView is called during ngAfterContentInit before the
      // activeViewChanged subscription is wired, and it must NOT emit.
      expect(host.syncActiveViewCallCount).toBeGreaterThanOrEqual(1);
      expect(host.syncedActiveViewId).toBeNull(); // Default = null

      // The selectedView in the canonical store should match.
      const facade = component["stateFacade"] as IbKaiTableStateFacade;
      expect(facade.selectedView()).toBeNull();
    });

    it("should NOT trigger a second applyView dispatch during sync", async () => {
      const store = TestBed.inject(Store);
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const dispatchSpy = spyOn(store, "dispatch").and.callThrough();
      const host = component.viewHost() as IbTableViewsHostStub;

      // Simulate a back/forward sync (same as the table's effect does)
      host.syncActiveView(null);
      await hostFixture.whenStable();

      // syncActiveView is a one-way notification — it must not result in
      // an additional dispatch (no feedback loop).
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    // ===========================================================================
    // Toolbar portals without filter — DEVK-1065 Step 7
    // ===========================================================================

    it("should forward toolbar portals from views host even when no ib-filter exists", fakeAsync(() => {
      const noFilterFixture = TestBed.createComponent(IbTableWithViewGroupNoFilterApp);
      noFilterFixture.detectChanges();
      tick();
      noFilterFixture.detectChanges();

      const c: IbTable = noFilterFixture.debugElement.query(
        By.directive(IbTable),
      ).componentInstance as IbTable;

      // Without a filter, actionPortals should contain only the host portal.
      expect(c.actionPortals.length).toBe(1);
      expect(c.actionPortals[0]).toBeInstanceOf(ComponentPortal);
    }));

    it("should initialize views host correctly when table has no filter", fakeAsync(() => {
      const noFilterFixture = TestBed.createComponent(IbTableWithViewGroupNoFilterApp);
      noFilterFixture.detectChanges();
      tick();
      noFilterFixture.detectChanges();

      const c: IbTable = noFilterFixture.debugElement.query(
        By.directive(IbTable),
      ).componentInstance as IbTable;
      const host = c.viewHost() as IbTableViewsHostStub;

      expect(host.defaultViewBaseline).not.toBeNull();
      expect(host.syncActiveViewCallCount).toBeGreaterThanOrEqual(1);
      expect(host.viewDataAccessor).toBeDefined();

      const data = host.viewDataAccessor();
      expect(data).toBeDefined();
      expect(data.pageSize).toBeGreaterThan(0);
    }));
  });

  // ===========================================================================
  // Table without views host — DEVK-1065 Step 7
  // ===========================================================================

  it("should work normally without a views host (no IbViewModule import needed)", fakeAsync(() => {
    // Reset TestBed for a clean configuration without views host components.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [IbTableApp],
      imports: [
        CommonModule,
        IbKaiTableModule,
        IbTableActionModule,
        IbFilterModule,
        MatSortModule,
        IbDataExportModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          extend: true,
        }),
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        provideStore(),
        { provide: MatSnackBar, useValue: { open: () => {} } },
        IbTableUrlService,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(IbTableApp);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const c: IbTable = fixture.debugElement.query(
      By.directive(IbTable),
    ).componentInstance as IbTable;

    expect(c.viewHost()).toBeFalsy();
    expect(c.initialized()).toBeTrue();
    expect(c.activeDataSource()).toBeDefined();

    const facade = c["stateFacade"] as IbKaiTableStateFacade;
    expect(facade.initialized()).toBeTrue();
  }));

  describe("with export", () => {
    let fixture: ComponentFixture<IbTableWithExport>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(async () => {
      fixture = createComponent(IbTableWithExport);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      fixture.detectChanges();
      await fixture.whenStable();
      loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should export entire dataset", async () => {
      const exportSpy = spyOn(component.exportService, "export");
      const exportButton = await loader.getHarness(
        MatButtonHarness.with({
          ancestor: ".ib-table__toolbar__actions",
        })
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(dialog).toBeTruthy();
      const confirm = await dialog.getHarness(
        MatButtonHarness.with({
          text: "shared.ibTable.export",
        })
      );
      await confirm.click();
      fixture.detectChanges();

      const localSource = component.activeDataSource() as IbTableLocalDataSource<IbExportRow>;
      expect(exportSpy).toHaveBeenCalledWith(
        localSource.data,
        component.tableName(),
        "ib"
      );
    });

    it("should export current page", async () => {
      const exportSpy = spyOn(component.exportService, "export");
      await fixture.whenStable();
      component.setPaginatorState({ pageIndex: 0, pageSize: 2 });
      fixture.detectChanges();
      await fixture.whenStable();
      const exportButton = await loader.getHarness(
        MatButtonHarness.with({
          ancestor: ".ib-table__toolbar__actions",
        })
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(dialog).toBeTruthy();
      const options = await dialog.getAllHarnesses(MatRadioButtonHarness);
      const option = (await Promise.all(
        options.map(async (radio) => ({ radio, value: await radio.getValue() })),
      )).find(({ value }) => value === "current")?.radio;
      expect(option).toBeDefined();
      await option.check();
      const confirm = await dialog.getHarness(
        MatButtonHarness.with({ text: "shared.ibTable.export" }),
      );
      await confirm.click();
      fixture.detectChanges();

      const ds = component.activeDataSource() as IbTableLocalDataSource<IbExportRow>;
      expect(exportSpy).toHaveBeenCalledWith(
        ds.data.slice(0, 2),
        component.tableName(),
        "ib",
      );
    });

    it("should export selected rows", async () => {

      const exportSpy = spyOn(component.exportService, "export");
      const localSource = component.activeDataSource() as IbTableLocalDataSource<IbExportRow>;

      component.selectionColumn().selection.select(
        ...localSource.data.slice(0, 2)
      );
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();

      const exportButton = await loader.getHarness(
        MatButtonHarness.with({
          ancestor: ".ib-table__toolbar__actions",
        })
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(dialog).toBeTruthy();
    });
  });

  describe("with export transformer", () => {
    let fixture: ComponentFixture<IbTableWithExportTransformer>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(() => {
      fixture = createComponent(IbTableWithExportTransformer);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should use transform function", async () => {
      const exportSpy = spyOn(component.exportService, "export");
      const exportButton = await loader.getHarness(
        MatButtonHarness.with({
          ancestor: ".ib-table__toolbar__actions",
        })
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(dialog).toBeTruthy();
      const confirm = await dialog.getHarness(
        MatButtonHarness.with({
          text: "shared.ibTable.export",
        })
      );
      await confirm.click();
      fixture.detectChanges();

      const localSource = component.activeDataSource() as IbTableLocalDataSource<IbExportTransformerRow>;
      const expectedData = localSource.data.map((e: any) => ({
        ...e,
        created_at: e.created_at.getTime(),
        updated_at: e.updated_at.getTime(),
      }));

      expect(exportSpy).toHaveBeenCalledWith(
        expectedData,
        component.tableName(),
        "ib"
      );
    });
  });

  describe("with sort", () => {
    let fixture: ComponentFixture<IbTableWithSort>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(() => {
      fixture = createComponent(IbTableWithSort);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should apply", async () => {
      const dataSource = component.activeDataSource() as IbTableLocalDataSource<any>;
      const sort = await loader.getHarness(MatSortHarness);
      const [_, number] = await sort.getSortHeaders();
      let active = await sort.getActiveHeader();
      expect(active).toBeNull();

      await number.click();

      active = await sort.getActiveHeader();
      let direction = await number.getSortDirection();
      expect(await active.getLabel()).toEqual(await number.getLabel());
      expect(component.sort().active).toBe("amount");
      expect(direction).toBe("asc");

      await number.click();
      direction = await number.getSortDirection();
      expect(direction).toBe("desc");

      const amountData = dataSource.getOrderedData().map((i) => i.amount);
      expect(amountData).toEqual([20, 10]);
    });
  });

  describe("with aggregate", () => {
    let fixture: ComponentFixture<IbTableWithAggregate>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(async () => {
      fixture = createComponent(IbTableWithAggregate);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      fixture.detectChanges();
      await fixture.whenStable();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should update aggregate state through the number column", () => {
      const dataSource = component.activeDataSource() as IbTableLocalDataSource<unknown>;
      const numberColumn = component.columns().find(
        (column) => column.name() === "amount",
      ) as {
        handleAggregationChange(fun: string): void;
      };

      expect(numberColumn).toBeTruthy();
      numberColumn.handleAggregationChange("sum");
      fixture.detectChanges();

      expect(dataSource.aggregatedColumns).toEqual({ amount: "sum" });
      expect(fixture.debugElement.query(By.directive(IbAggregateCell))).toBeTruthy();
    });

    it("should render the aggregation footer as sticky", () => {
      component.setAggregation("amount", "sum");
      fixture.detectChanges();

      const footer = fixture.nativeElement.querySelector(
        ".mat-mdc-footer-cell",
      ) as HTMLElement;

      expect(footer).toBeTruthy();
      expect(getComputedStyle(footer).position).toBe("sticky");
    });

  });

  describe("with a custom aggregate provider", () => {
    it("should forward the injected aggregate to the local data source", async () => {
      const fixture = createComponent(IbTableWithCustomAggregate);
      const component = fixture.debugElement.query(By.directive(IbTable)).componentInstance as IbTable;
      const dataSource = component.activeDataSource() as IbTableLocalDataSource<unknown>;

      await fixture.whenStable();
      fixture.detectChanges();

      const aggregates = component["aggregationFunctions"] as IbAggregate[];
      expect(aggregates.some((aggregate) => aggregate.id === "test-product")).toBeTrue();

      component.setPaginatorState({ pageIndex: 0, pageSize: 2 });
      component.setAggregation("amount", "test-product");
      await fixture.whenStable();
      fixture.detectChanges();

      expect(dataSource.aggregatedColumns).toEqual({ amount: "test-product" });
      expect(dataSource.aggregatedData.amount).toEqual({ total: 24, currentPage: 6 });
    });
  });

  // ===========================================================================
  // NEW TESTS — DEVK-1066 Step 14
  // ===========================================================================

  describe("tableName required", () => {
    it("should require tableName as a required input", () => {
      configureModule(IbTableWithoutTableName);
      const fixture = TestBed.createComponent(IbTable);

      expect(() => fixture.componentInstance.tableName()).toThrow();
    });
  });

  describe("data source conflict", () => {
    it("should throw when both [data] and [dataSource] are set", () => {
      configureModule(IbTableWithBothDataAndDataSource);

      expect(() => {
        const fixture = TestBed.createComponent(IbTableWithBothDataAndDataSource);
        fixture.detectChanges();
      }).toThrowError("[IbTable] [data] and [dataSource] cannot be used together.");
    });
  });

  describe("initialization", () => {
    let fixture: ComponentFixture<IbTableApp>;
    let component: IbTable;

    beforeEach(waitForAsync(() => {
      configureModule(IbTableApp);
    }));

    beforeEach(async () => {
      fixture = TestBed.createComponent(IbTableApp);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      await fixture.detectChanges();
      await fixture.whenStable();
    });

    it("should initialize facade with tableName, tableDef, and viewHost", () => {
      const facade = component["stateFacade"] as IbKaiTableStateFacade;
      expect(facade.tableName).toBe("test-basic");
    });

    it("should create an internal local data source when using [data] shorthand", async () => {
      const ds = component.activeDataSource() as IbTableLocalDataSource<any>;
      expect(ds instanceof IbTableLocalDataSource).toBeTrue();
      expect(ds).toBeDefined();
      expect(ds.data.length).toBeGreaterThan(0);
    });

    it("should render table with rows matching active filter", async () => {
      const loader = TestbedHarnessEnvironment.loader(fixture);
      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      // IbTableApp has filterValue = { color: ["black"] } which filters to 1 row
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    it("should initialize state with technical defaults (sort null, filters null, pageIndex 0)", async () => {
      const snapshot = component["stateFacade"].snapshot();
      expect(snapshot.sort).toBeNull();
      expect(snapshot.filters).toBeNull();
      expect(snapshot.pageIndex).toBe(0);
      expect(snapshot.pageSize).toBe(20);
    });
  });

  describe("tag filter option initialization", () => {
    it("should initialize implicit tag filter options when data arrives after table initialization", async () => {
      const fixture = createComponent(IbTableWithAsyncTagFilterData);
      const tagFilter = fixture.debugElement.query(
        By.directive(IbTagFilter),
      ).componentInstance as IbTagFilter;

      await fixture.whenStable();
      expect(tagFilter.options).toEqual([]);

      fixture.componentInstance.data = [
        { fruit: "banana" },
        { fruit: "apple" },
        { fruit: "banana" },
      ];
      fixture.detectChanges();
      await fixture.whenStable();

      expect(tagFilter.options).toEqual(["apple", "banana"]);
    });

    it("should not override explicit tag filter options for local [data]", async () => {
      const fixture = createComponent(IbTableWithExplicitTagFilterOptions);
      const tagFilter = fixture.debugElement.query(
        By.directive(IbTagFilter),
      ).componentInstance as IbTagFilter;

      await fixture.whenStable();

      expect(tagFilter.options).toEqual(["preset"]);
    });

    it("should not initialize tag filter options for an explicit local data source", async () => {
      configureModule(IbTableWithLocalDataSourceTagFilter);
      const initializeSpy = spyOn(IbTagFilter.prototype, "initializeFromColumn");
      const fixture = TestBed.createComponent(IbTableWithLocalDataSourceTagFilter);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(initializeSpy).not.toHaveBeenCalled();
    });

    it("should not initialize tag filter options for a remote data source", async () => {
      configureModule(IbTableWithRemoteDataApp);
      const initializeSpy = spyOn(IbTagFilter.prototype, "initializeFromColumn");
      const fixture = TestBed.createComponent(IbTableWithRemoteDataApp);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(initializeSpy).not.toHaveBeenCalled();
    });
  });

  describe("with normalized local filters", () => {
    it("should retain matching rows when search is applied with inactive tag and date filters", fakeAsync(() => {
      const fixture = createComponent(IbTableWithFullFilterApp);
      const component = fixture.debugElement.query(By.directive(IbTable)).componentInstance as IbTable;
      const searchBar = fixture.debugElement.query(By.directive(IbSearchBar)).componentInstance as IbSearchBar;

      // Settle asynchronous table initialization (facade store init and the
      // effect wiring the filter to the facade) before interacting.
      tick();
      fixture.detectChanges();

      // Drive the real update path: searchCriteria valueChanges -> debounced
      // applyFilter() -> IbFilter.update() -> ibFilterUpdated -> facade.setFilters
      // -> NgRx snapshot -> applySnapshot -> local data source recompute.
      // debounceTime(0) schedules on the RxJS asyncScheduler (a macrotask that
      // whenStable cannot observe), so flush it deterministically with tick().
      searchBar.searchCriteria.setValue("alice");
      tick();
      fixture.detectChanges();

      const source = component.activeDataSource() as IbTableLocalDataSource<unknown>;
      expect(source.getFilteredData()).toEqual([fixture.componentInstance.data[0]]);
    }));
  });

  describe("data source replacement", () => {
    it("should handle runtime data source replacement", async () => {
      configureModule(IbTableWithDataSourceReplacement);
      const fixture = TestBed.createComponent(IbTableWithDataSourceReplacement);
      fixture.detectChanges();
      await fixture.whenStable();

      const c: IbTable = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;

      const initialSource = c.activeDataSource() as IbTableLocalDataSource<IbNamedRow>;
      expect(initialSource.data).toEqual([{ name: "first" }]);

      fixture.componentInstance.currentSource = new IbTableLocalDataSource([{ name: "replaced" }]);
      fixture.detectChanges();
      await fixture.whenStable();

      const newSource = c.activeDataSource() as IbTableLocalDataSource<IbNamedRow>;
      expect(newSource.data).toEqual([{ name: "replaced" }]);
      expect(newSource).not.toBe(initialSource);
      expect(initialSource.data).toEqual([{ name: "first" }]);
    });
  });

  describe("with IbTableLocalDataSource", () => {
    it("should render an explicitly bound local data source", async () => {
      const fixture = createComponent(IbTableWithLocalDataSourceApp);
      await fixture.whenStable();
      fixture.detectChanges();

      const component = fixture.debugElement.query(By.directive(IbTable)).componentInstance as IbTable;
      const table = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatTableHarness);

      expect(component.activeDataSource()).toBe(fixture.componentInstance.dataSource);
      expect(await table.getRows()).toHaveSize(1);
    });
  });

  describe("sort/filter reset pageIndex", () => {
    it("sort change should dispatch action that resets pageIndex in store", async () => {
      const fixture = createComponent(IbTableWithTableDef);
      const component = fixture.debugElement.query(
        By.directive(IbTable),
      ).componentInstance as IbTable;
      await fixture.whenStable();
      const facade = component["stateFacade"] as IbKaiTableStateFacade;
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, "dispatch").and.callThrough();

      facade.setPaginator(3, 10);
      facade.setSort({ active: "name", direction: "asc" });

      expect(dispatchSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          tableName: "test-tabledef",
          sort: { active: "name", direction: "asc" },
        }),
      );
      expect(facade.snapshot().pageIndex).toBe(0);
    });
  });

  describe("stores and url binding", () => {
    it("should write state to URL after user interaction", async () => {
      const fixture = createComponent(IbTableApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable),
      ).componentInstance as IbTable;
      const urlService = TestBed.inject(IbTableUrlService);
      const writeStateSpy = spyOn(urlService, "writeState");
      const facade = component["stateFacade"] as IbKaiTableStateFacade;

      await fixture.whenStable();
      facade.setSort({ active: "name", direction: "asc" });

      expect(writeStateSpy).toHaveBeenCalled();
      expect(writeStateSpy.calls.mostRecent().args[0]).toBe("test-basic");
      expect(writeStateSpy.calls.mostRecent().args[1].sort).toEqual({
        active: "name",
        direction: "asc",
      });
    });
  });

  describe("selectedView null", () => {
    it("should default selectedView to null when no views host is present", async () => {
      configureModule(IbTableApp);
      const fixture = TestBed.createComponent(IbTableApp);
      const c: IbTable = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance as IbTable;
      fixture.detectChanges();
      await fixture.whenStable();

      const snapshot = c["stateFacade"].snapshot();
      expect(snapshot.selectedView).toBeNull();
    });
  });

  describe("remote first fetch", () => {
    it("should fetch data exactly once after initialization", fakeAsync(() => {
      const fixture = createComponent(IbTableWithRemoteDataApp);
      const remoteDs = fixture.componentInstance.dataSource;
      const fetchSpy = spyOn(remoteDs, "fetchData").and.callThrough();

      tick(1000);
      fixture.detectChanges();

      expect(fetchSpy.calls.count()).toBe(1);
    }));

    it("should fetch data exactly once when mobile sorting after initialization", fakeAsync(() => {
      const fixture = createComponent(IbTableWithRemoteDataApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable),
      ).componentInstance as IbTable;
      const remoteDs = fixture.componentInstance.dataSource;
      const fetchSpy = spyOn(remoteDs, "fetchData").and.callThrough();

      tick(1000);
      fetchSpy.calls.reset();

      component.updateSortFromMobile({ active: "name", direction: "asc" });
      fixture.detectChanges();
      tick(1000);

      expect(fetchSpy.calls.count()).toBe(1);
    }));
  });

  describe("with remote data source and async search bar", () => {
    it("should fetch once with the hydrated query and not refetch after silent hydration", fakeAsync(() => {
      const fetchSpy = spyOn(IbTestDataSource.prototype, "fetchData").and.callThrough();
      const fixture = createComponent(IbTableWithRemoteSearchApp);

      tick(1000);
      fixture.detectChanges();
      tick(2000);
      fixture.detectChanges();

      // the initial request reached the backend exactly once, carrying the
      // hydrated IbFilter.query output (undefined-valued keys included)
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const request = fetchSpy.calls.argsFor(0)[0];
      expect(request).toEqual({
        sort: null,
        pageIndex: 0,
        pageSize: 20,
        filter: { ibSearchBar: undefined },
      });
      expect(Object.prototype.hasOwnProperty.call(request.filter, "ibSearchBar")).toBeTrue();
      expect(request.filter.ibSearchBar).toBeUndefined();
    }));
  });

  describe("paginator restoration", () => {
    it("should restore paginator state from snapshot after initialization", async () => {
      const fixture = createComponent(IbTableWithTableDef);
      const component = fixture.debugElement.query(
        By.directive(IbTable),
      ).componentInstance as IbTable;
      await fixture.whenStable();

      expect(component.paginator()?.pageIndex).toBe(0);
      expect(component.paginator()?.pageSize).toBe(10);
    });
  });

  describe("desktop height and scroll layout", () => {
    let fixture: ComponentFixture<IbTableHeightHost>;
    let host: IbTableHeightHost;

    beforeEach(waitForAsync(() => {
      configureModule(IbTableHeightHost);
    }));

    beforeEach(async () => {
      fixture = TestBed.createComponent(IbTableHeightHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.debugElement.queryAll(By.directive(IbTable)).forEach((element) => {
        (element.componentInstance as IbTable).isMobile = false;
      });
      fixture.detectChanges();
      (fixture.nativeElement.querySelectorAll(".ib-table-desktop") as NodeListOf<HTMLElement>)
        .forEach((element) => element.style.setProperty("display", "flex", "important"));
      (fixture.nativeElement.querySelectorAll(".ib-table-mobile") as NodeListOf<HTMLElement>)
        .forEach((element) => element.style.setProperty("display", "none", "important"));
    });

    it("should use parent mode when tableHeight is omitted", () => {
      const omittedTable = fixture.nativeElement.querySelector(
        ".ib-table-height-host__omitted ib-kai-table",
      ) as HTMLElement;

      expect(omittedTable.classList).toContain("ib-table__container--parent-height");
      expect(omittedTable.querySelector(".ib-table__content")!.classList)
        .toContain("ib-table__content--parent-height");
    });

    it("should normalize empty and whitespace tableHeight values to parent mode", async () => {
      const table = heightTableElement(fixture);
      const component = fixture.debugElement.queryAll(By.directive(IbTable))[1]
        .componentInstance as IbTable;

      host.tableHeight = "";
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      expect(component.usesParentHeight()).toBeTrue();
      expect(table.classList).toContain("ib-table__container--parent-height");

      host.tableHeight = "   ";
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      expect(component.usesParentHeight()).toBeTrue();
      expect(table.classList).toContain("ib-table__container--parent-height");
    });

    it("should fill a definitively sized parent in parent mode", () => {
      const parent = fixture.nativeElement.querySelector(
        ".ib-table-height-host__bound",
      ) as HTMLElement;
      const table = heightTableElement(fixture);
      const desktop = table.querySelector<HTMLElement>(".ib-table-desktop")!;

      expect(table.classList).toContain("ib-table__container--parent-height");
      expect(getComputedStyle(desktop).display).toBe("flex");
    });

    it("should give a short dataset an exact 500px content viewport", () => {
      host.tableHeight = "500px";
      fixture.detectChanges();

      const content = heightTableElement(fixture).querySelector<HTMLElement>(
        ".ib-table__content",
      )!;

      expect(content.classList).toContain("ib-table__content--exact-height");
      expect(getComputedStyle(content).height).toBe("500px");
    });

    it("should use the 400px default minimum content height in parent mode", () => {
      const content = heightTableElement(fixture).querySelector<HTMLElement>(
        ".ib-table__content",
      )!;

      expect(getComputedStyle(content).minHeight).toContain("400px");
    });

    it("should honor a custom minimum content height CSS variable", () => {
      host.minimumContentHeight = "420px";
      fixture.detectChanges();

      const content = heightTableElement(fixture).querySelector<HTMLElement>(
        ".ib-table__content",
      )!;
      const table = fixture.nativeElement.querySelector(
        ".ib-table-height-host__bound",
      ) as HTMLElement;

      expect(table.style.getPropertyValue("--ib-table-min-content-height")).toBe("420px");
    });

    it("should keep toolbar, projected filter, and paginator outside the content viewport", () => {
      const table = heightTableElement(fixture);
      const content = table.querySelector<HTMLElement>(".ib-table__content")!;
      const toolbar = table.querySelector<HTMLElement>(".ib-table__toolbar")!;
      const filter = table.querySelector<HTMLElement>("ib-filter")!;
      const paginator = table.querySelector<HTMLElement>(".ib-table__paginator")!;

      expect(content.contains(toolbar)).toBeFalse();
      expect(content.contains(filter)).toBeFalse();
      expect(content.contains(paginator)).toBeFalse();
    });

    it("should keep content as the only table-owned scroll container", () => {
      const table = heightTableElement(fixture);
      const ownedElements: HTMLElement[] = [
        table,
        ...Array.from(table.querySelectorAll<HTMLElement>("*")),
      ].filter((el) => {
        let ancestor = el.parentElement;
        while (ancestor && ancestor !== table) {
          if (/^IB-/i.test(ancestor.tagName)) return false;
          ancestor = ancestor.parentElement;
        }
        return true;
      });

      const scrollOwners = ownedElements.filter((element) => {
        const style = getComputedStyle(element);
        return [style.overflow, style.overflowX, style.overflowY].some(
          (value) => value === "auto" || value === "scroll",
        );
      });

      expect(scrollOwners).toEqual([
        table.querySelector<HTMLElement>(".ib-table__content")!,
      ]);
    });

    it("should retain sticky header and sticky column styles inside content", () => {
      const content = heightTableElement(fixture).querySelector<HTMLElement>(
        ".ib-table__content",
      )!;
      const header = content.querySelector<HTMLElement>("th.mat-column-name")!;
      const stickyColumn = content.querySelector<HTMLElement>("td.mat-column-name")!;

      expect(getComputedStyle(header).position).toBe("sticky");
      expect(getComputedStyle(stickyColumn).position).toBe("sticky");
    });
  });
});

function heightTableElement(fixture: ComponentFixture<IbTableHeightHost>): HTMLElement {
  return fixture.nativeElement.querySelector(
    ".ib-table-height-host__bound ib-kai-table",
  ) as HTMLElement;
}

// ===========================================================================
// Test Helpers
// ===========================================================================

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [type, IbTestViewsHostComponent],
    imports: [
      CommonModule,
      IbKaiTableModule,
      IbTableActionModule,
      IbFilterModule,
      MatSortModule,
      IbDataExportModule,
      NoopAnimationsModule,
      TranslateModule.forRoot({
        extend: true,
      }),
      RouterTestingModule.withRoutes([])
    ],
    providers: [
      provideStore(),
      { provide: MatSnackBar, useValue: { open: () => { } } },
      IbTableUrlService,
    ],
  }).compileComponents();
}

function createComponent<T>(type: Type<T>): ComponentFixture<T> {
  configureModule(type);

  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

// ===========================================================================
// Host Components
// ===========================================================================

@Component({
  template: `
    <ib-kai-table tableName="test-basic" [data]="data" [displayedColumns]="['name', 'color', 'price']">
      <ib-filter [value]="filterValue">
        <ib-text-filter name="name">Name</ib-text-filter>
        <ib-tag-filter name="color">Name</ib-tag-filter>
        <ib-number-filter name="price">Name</ib-number-filter>
      </ib-filter>
      <ib-selection-column></ib-selection-column>
      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="color"></ib-text-column>
      <ib-number-column name="price"></ib-number-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableApp {
  filterValue = { color: ["black"] };
  data = [
    { name: "alice", color: "white", price: 10 },
    { name: "bob", color: "black", price: 12 },
  ];
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-async-tag-filter"
      [data]="data"
      [displayedColumns]="['fruit']"
    >
      <ib-filter>
        <ib-tag-filter name="fruit">Fruit</ib-tag-filter>
      </ib-filter>
      <ib-text-column name="fruit"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class IbTableWithAsyncTagFilterData {
  data: { fruit: string }[] = [];
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-explicit-tag-filter-options"
      [data]="data"
      [displayedColumns]="['fruit']"
    >
      <ib-filter>
        <ib-tag-filter name="fruit" [options]="options">Fruit</ib-tag-filter>
      </ib-filter>
      <ib-text-column name="fruit"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class IbTableWithExplicitTagFilterOptions {
  options = ["preset"];
  data = [{ fruit: "banana" }, { fruit: "apple" }];
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-local-tag-filter"
      [dataSource]="dataSource"
      [displayedColumns]="['fruit']"
    >
      <ib-filter>
        <ib-tag-filter name="fruit">Fruit</ib-tag-filter>
      </ib-filter>
      <ib-text-column name="fruit"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class IbTableWithLocalDataSourceTagFilter {
  dataSource = new IbTableLocalDataSource([{ fruit: "banana" }]);
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-full-filter"
      [data]="data"
      [displayedColumns]="['name', 'color', 'amount', 'createdAt', 'active']"
    >
      <ib-filter>
        <ib-search-bar></ib-search-bar>
        <ib-text-filter name="name">Name</ib-text-filter>
        <ib-tag-filter name="color">Color</ib-tag-filter>
        <ib-number-filter name="amount">Amount</ib-number-filter>
        <ib-date-filter name="createdAt">Created</ib-date-filter>
        <ib-boolean-filter name="active">Active</ib-boolean-filter>
      </ib-filter>
      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="color"></ib-text-column>
      <ib-number-column name="amount"></ib-number-column>
      <ib-date-column name="createdAt"></ib-date-column>
      <ib-text-column name="active"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class IbTableWithFullFilterApp {
  data = [
    { name: "alice", color: "white", amount: 10, createdAt: new Date("2024-01-01"), active: true },
    { name: "bob", color: "black", amount: 20, createdAt: new Date("2024-02-01"), active: false },
  ];
}

@Component({
  template: `
    <ib-kai-table tableName="test-rowgroup" [data]="data" [displayedColumns]="['name']">
      <ib-text-column name="name"></ib-text-column>
      <ng-template ibKaiRowGroup let-row="row">
        row data: {{ row | json }}
      </ng-template>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithRowGroupApp {
  data = [{ name: "alice" }];
}

@Injectable()
class IbTestDataSource extends IbTableRemoteDataSource<any, any> {
  fetchData(
    _request: IbRemoteDataSourceRequest,
  ): Observable<IbFetchDataResponse<any>> {
    return timer(1).pipe(map(() => ({
      data: [{ name: "alice" }],
      totalCount: 1,
    })));
  }
}

@Component({
  template: `
    <ib-kai-table tableName="test-remote" [dataSource]="dataSource" [displayedColumns]="['name']">
      <ib-filter>
        <ib-text-filter name="name">Name</ib-text-filter>
      </ib-filter>
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithRemoteDataApp {
  dataSource = new IbTestDataSource();
}

@Component({
  template: `
    <ib-kai-table tableName="test-remote-search" [dataSource]="dataSource" [displayedColumns]="['name']">
      <ib-filter>
        <ib-search-bar async></ib-search-bar>
      </ib-filter>
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithRemoteSearchApp {
  dataSource = new IbTestDataSource();
}

@Component({
  selector: 'ib-test-views-host',
  template: '',
  providers: [{ provide: IbTableViewsHost, useExisting: IbTestViewsHostComponent }],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTestViewsHostComponent extends IbTableViewsHostStub {}

@Component({
  selector: 'ib-test-views-host-with-portal',
  template: '',
  providers: [{ provide: IbTableViewsHost, useExisting: IbTestViewsHostWithPortalComponent }],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class IbTestViewsHostWithPortalComponent extends IbTableViewsHostStub {
  constructor() {
    super();
    this.addToolbarPortal(new ComponentPortal(DummyPortalComponent));
  }
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-views"
      [data]="data"
      [displayedColumns]="['name', 'color']"
    >
      <ib-test-views-host></ib-test-views-host>
      <ib-filter>
        <ib-tag-filter name="color">Color</ib-tag-filter>
      </ib-filter>

      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="color"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithViewGroupApp {
  data = [
    { name: "alice", color: "peach" },
    { name: "bob", color: "green" },
  ];
}

/** Minimal component used as a ComponentPortal payload in toolbar-portal tests. */
@Component({ template: '', changeDetection: ChangeDetectionStrategy.Eager,
 standalone: false })
class DummyPortalComponent {}

@Component({
  template: `
    <ib-kai-table
      tableName="test-views-no-filter"
      [data]="data"
      [displayedColumns]="['name']"
    >
      <ib-test-views-host-with-portal></ib-test-views-host-with-portal>
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithViewGroupNoFilterApp {
  data = [{ name: "alice" }];
}

class IbStubExportProvider implements IbDataExportProvider {
  format = "ib";
  label = "inobeta";
  export(_data: any[], _filename: string): void { }
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-export"
      [data]="data"
      [tableDef]="{ paginator: { pageSize: 5 } }"
      [displayedColumns]="['name', 'color']"
    >
      <ib-table-action-group>
        <ng-template ibTableAction [kind]="'export'"></ng-template>
      </ib-table-action-group>
      <ib-selection-column></ib-selection-column>
      <ib-text-column headerText="name" name="name"></ib-text-column>
      <ib-text-column headerText="color" name="color"></ib-text-column>
    </ib-kai-table>
  `,
  providers: [
    IbDataExportService,
    {
      provide: OVERRIDE_EXPORT_FORMATS,
      useClass: IbStubExportProvider,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithExport {
  data = [
    { name: "alice", color: "blue" },
    { name: "rabbit", color: "white" },
    { name: "queen", color: "red" },
    { name: "cat", color: "black" },
    { name: "rook", color: "purple" },
    { name: "knight", color: "brown" },
    { name: "king", color: "green" },
  ];
}

/** Remote source with a synchronously resolved, controlled response. */
class IbRemoteExportDataSource extends IbTableRemoteDataSource<any, any> {
  fetchData(
    _request: IbRemoteDataSourceRequest
  ): Observable<IbFetchDataResponse<any>> {
    return of({
      data: [{ name: "alice" }, { name: "bob" }],
      totalCount: 10,
    });
  }
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-remote-export"
      [dataSource]="dataSource"
      [tableDef]="{ paginator: { pageSize: 2 } }"
      [displayedColumns]="['name']"
    >
      <ib-table-action-group>
        <ng-template ibTableAction [kind]="'export'"></ng-template>
      </ib-table-action-group>
      <ib-text-column headerText="name" name="name"></ib-text-column>
    </ib-kai-table>
  `,
  providers: [
    IbDataExportService,
    {
      provide: OVERRIDE_EXPORT_FORMATS,
      useClass: IbStubExportProvider,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithRemoteExportApp {
  dataSource = new IbRemoteExportDataSource();
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-local-export"
      [dataSource]="dataSource"
      [tableDef]="{ paginator: { pageSize: 2 } }"
      [displayedColumns]="['name']"
    >
      <ib-table-action-group>
        <ng-template ibTableAction [kind]="'export'"></ng-template>
      </ib-table-action-group>
      <ib-selection-column></ib-selection-column>
      <ib-text-column headerText="name" name="name"></ib-text-column>
    </ib-kai-table>
  `,
  providers: [
    IbDataExportService,
    {
      provide: OVERRIDE_EXPORT_FORMATS,
      useClass: IbStubExportProvider,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithLocalExportApp {
  dataSource = new IbTableLocalDataSource([
    { name: "a" },
    { name: "b" },
    { name: "c" },
    { name: "d" },
    { name: "e" },
    { name: "f" },
  ]);
}

/** Local table without any selection column (DEVK-1105 selection gating). */
@Component({
  template: `
    <ib-kai-table
      tableName="test-export-no-selection"
      [data]="data"
      [displayedColumns]="['name', 'color']"
    >
      <ib-table-action-group>
        <ng-template ibTableAction [kind]="'export'"></ng-template>
      </ib-table-action-group>
      <ib-text-column headerText="name" name="name"></ib-text-column>
      <ib-text-column headerText="color" name="color"></ib-text-column>
    </ib-kai-table>
  `,
  providers: [
    IbDataExportService,
    {
      provide: OVERRIDE_EXPORT_FORMATS,
      useClass: IbStubExportProvider,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithExportNoSelection {
  data = [
    { name: "alice", color: "blue" },
    { name: "rabbit", color: "white" },
    { name: "queen", color: "red" },
  ];
}

/** Minimal IbColumn-shaped object used to drive export column mapping. */
function createExportColumn(name: string, headerText: string): IbColumn<unknown> {
  return {
    name: () => name,
    headerText: () => headerText,
    dataAccessor: () => (row: unknown, colName: string) =>
      (row as Record<string, unknown>)[colName],
    sortingDataAccessor: () => (row: unknown, colName: string) =>
      (row as Record<string, unknown>)[colName],
    filterDataAccessor: () => (row: unknown, colName: string) =>
      (row as Record<string, unknown>)[colName],
  } as unknown as IbColumn<unknown>;
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-export-transformer"
      [data]="data"
      [displayedColumns]="['name', 'created_at', 'updated_at']"
    >
      <ib-table-action-group>
        <ng-template ibTableAction [kind]="'export'"></ng-template>
      </ib-table-action-group>
      <ib-selection-column></ib-selection-column>
      <ib-text-column headerText="name" name="name" />
      <ib-date-column
        headerText="created_at"
        name="created_at"
        [ibDataTransformer]="dateTransformer"
      />
      <ib-date-column
        headerText="updated_at"
        name="updated_at"
        [ibDataTransformer]="{
          ib: dateTransformer
        }"
      />
    </ib-kai-table>
  `,
  providers: [
    IbDataExportService,
    {
      provide: OVERRIDE_EXPORT_FORMATS,
      useClass: IbStubExportProvider,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithExportTransformer {
  data = [
    { name: "alice", created_at: new Date(), updated_at: new Date() },
    { name: "rabbit", created_at: new Date(), updated_at: new Date() },
  ];

  dateTransformer = (date: Date) => date.getTime();
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-sort"
      [data]="data"
      [displayedColumns]="['name', 'amount', 'createdAt']"
    >
      <ib-text-column name="name" [aggregate]="false"></ib-text-column>
      <ib-column name="amount" headerText="Amount" sort>
        <ng-template *ibCellDef="let element">{{ element.amount }}</ng-template>
      </ib-column>
      <ib-date-column name="createdAt" sort></ib-date-column>
      <ib-column ib-action-column>
        <section *ibCellDef="let element">{{ element.amount }}</section>
      </ib-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithSort {
  data = [
    { name: "alice", amount: 10, createdAt: new Date() },
    { name: "bob", amount: 20, createdAt: new Date() },
  ];
}

@Component({
  template: `
    <ib-kai-table tableName="test-aggregate" [data]="data" [displayedColumns]="['name', 'amount']">
      <ib-text-column name="name"></ib-text-column>
      <ib-number-column name="amount" aggregate></ib-number-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithAggregate {
  data = [
    { name: "alice", amount: 10 },
    { name: "bob", amount: 20 },
  ];
}

class IbTestProductAggregate extends IbAggregate {
  id = "test-product";
  name = "test.product.name";
  label = "test.product.label";
  type = "number";

  aggregateData(data: unknown[]): number {
    return data.reduce<number>((product, value) => product * Number(value), 1);
  }
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-custom-aggregate"
      [data]="data"
      [displayedColumns]="['amount']"
    >
      <ib-number-column name="amount" aggregate></ib-number-column>
    </ib-kai-table>
  `,
  providers: [
    { provide: IB_AGGREGATE, useClass: IbTestProductAggregate, multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class IbTableWithCustomAggregate {
  data = [{ amount: 2 }, { amount: 3 }, { amount: 4 }];
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-tabledef"
      [data]="data"
      [tableDef]="{ paginator: { pageSize: 10, pageIndex: 0 } }"
      [displayedColumns]="['name']"
    >
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithTableDef {
  data = [{ name: "alice" }, { name: "bob" }];
}

@Component({
  template: `
    <ib-kai-table [data]="data" [displayedColumns]="['name']">
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithoutTableName {
  data = [{ name: "alice" }];
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-both"
      [data]="data"
      [dataSource]="dataSource"
      [displayedColumns]="['name']"
    >
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithBothDataAndDataSource {
  data = [{ name: "alice" }];
  dataSource = new IbTableLocalDataSource([{ name: "bob" }]);
}

@Component({
  template: `
    <ib-kai-table
      tableName="test-replacement"
      [dataSource]="currentSource"
      [displayedColumns]="['name']"
    >
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
class IbTableWithDataSourceReplacement {
  currentSource = new IbTableLocalDataSource([{ name: "first" }]);
}

@Component({
  template: `
    <ib-kai-table tableName="test-local" [dataSource]="dataSource" [displayedColumns]="['name']">
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class IbTableWithLocalDataSourceApp {
  dataSource = new IbTableLocalDataSource([{ name: "alice" }]);
}

@Component({
  template: `
    <div class="ib-table-height-host__omitted" style="height: 700px">
      <ib-kai-table
        tableName="test-height-omitted"
        [data]="data"
        [displayedColumns]="['name', 'description']"
      >
        <ib-text-column name="name" [sticky]="true"></ib-text-column>
        <ib-text-column name="description"></ib-text-column>
      </ib-kai-table>
    </div>

    <div
      class="ib-table-height-host__bound"
      [style.height]="parentHeight"
      [style.--ib-table-min-content-height]="minimumContentHeight"
    >
      <ib-kai-table
        tableName="test-height-bound"
        [data]="data"
        [tableHeight]="tableHeight"
        [displayedColumns]="['name', 'description']"
      >
        <ib-filter>
          <ib-text-filter name="name">Name</ib-text-filter>
        </ib-filter>
        <ib-text-column name="name" [sticky]="true"></ib-text-column>
        <ib-text-column name="description"></ib-text-column>
      </ib-kai-table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class IbTableHeightHost {
  parentHeight = "700px";
  tableHeight = "parent";
  minimumContentHeight: string | null = null;
  data = [
    { name: "alice", description: "short dataset" },
    { name: "bob", description: "short dataset" },
  ];
}
