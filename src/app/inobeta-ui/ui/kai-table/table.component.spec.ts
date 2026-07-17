import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule } from "@angular/common";
import { Component, Injectable, Type } from "@angular/core";
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
import { MatPaginator } from "@angular/material/paginator";
import { MatRadioButtonHarness } from "@angular/material/radio/testing";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatSortHarness } from "@angular/material/sort/testing";
import { MatTableHarness } from "@angular/material/table/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { EffectsModule } from "@ngrx/effects";
import { provideStore } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TranslateModule } from "@ngx-translate/core";
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import { Observable, map, throwError, timer } from "rxjs";
import {
  IbDataExportModule,
  IbDataExportService,
  OVERRIDE_EXPORT_FORMATS
} from "../data-export";
import { IbDataExportProvider } from "../data-export/provider";
import { IbFilterModule } from "../kai-filter";
import { IbTableActionModule } from "./action";
import { IbTableViewsHost } from "./table-views-host";
import { IbTableViewsHostStub } from "./table-views-host.stub.spec";
import { IbAggregateCell } from "./cells";
import {
  IbFetchDataResponse,
  IbTableRemoteDataSource,
} from "./remote-data-source";
import { urlStateActions } from "./store/url-state/actions";
import { UrlStateEffects } from "./store/url-state/effects";
import { IbTableDataSource } from "./table-data-source";
import { IbTableUrlService } from "./table-url.service";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";

// Locale registration required by DecimalPipe / DatePipe in columns
registerLocaleData(localeIt);

describe("IbTable", () => {
  describe("with IbTableDataSource", () => {
    let host: IbTableApp;
    let fixture: ComponentFixture<IbTableApp>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(waitForAsync(() => {
      configureModule(IbTableApp);
    }));

    beforeEach(async () => {
      fixture = TestBed.createComponent(IbTableApp);
      host = fixture.componentInstance;
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      await fixture.detectChanges();
      await fixture.whenStable();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should create", async () => {
      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      expect(component).toBeTruthy();
      expect(rows.length).toBe(2);
    });

    it("should select a row", () => {
      const row = { name: "alice" };
      component.selectionColumn.toggleRowSelection({ checked: true }, row);
      fixture.detectChanges();
      expect(component.selectionColumn.selection.isSelected(row)).toBeTruthy();
    });

    it("should toggle all rows", () => {
      component.selectionColumn.toggleAllRows();
      fixture.detectChanges();
      expect(component.selectionColumn.isAllSelected()).toBeTruthy();
      component.selectionColumn.toggleAllRows();
      fixture.detectChanges();
      expect(component.selectionColumn.isAllSelected()).toBeFalsy();
    });
  });

  describe("with IbRemoteTableDataSource", () => {
    it("should create", fakeAsync(() => {
      const fixture = createComponent(IbTableWithRemoteDataApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      tick(1000) //DEVK-346 we add a debounceTime time of 500ms in order to avoid multiple requests
      expect(component).toBeTruthy();
      expect(component.dataSource.state).toBe("idle");
    }));

    it("should show error on exception", fakeAsync(() => {
      const fixture = createComponent(IbTableWithRemoteDataApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      fixture.componentInstance.dataSource.fetchData = () =>
        throwError(() => new Error());
      component.dataSource.refresh();
      tick(500);
      fixture.detectChanges();
      expect(component.state).toBe("http_error");
    }));
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

    beforeEach(() => {
      hostFixture = createComponent(IbTableWithViewGroupApp);
      component = hostFixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      loader = TestbedHarnessEnvironment.documentRootLoader(hostFixture);
    });

    it("should create with stub views host", () => {
      expect(component).toBeTruthy();
      expect(component.viewHost).toBeTruthy();
      expect(component.viewHost instanceof IbTableViewsHostStub).toBeTrue();
    });

    it("should initialize views host on creation", async () => {
      // Wait for filter.initialized -> setTimeout(() => viewInit())
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost as IbTableViewsHostStub;
      expect(host.viewGroupName).toBe("employees");
      expect(typeof host.viewDataAccessor).toBe("function");

      const data = host.viewDataAccessor();
      expect(data.filter).toBeDefined();
      expect(data.pageSize).toBeGreaterThan(0);
      expect(data.sort).toBeDefined();
      expect(data.aggregatedColumns).toBeDefined();

      expect(component.dataSource.view).toBe(host);

      // toolbarPortals: hide filter action portal is pushed in setupViewGroup()
      expect(component.actionPortals.length).toBe(1);

      // Host binding class is present
      const hostEl = hostFixture.debugElement.query(By.directive(IbTable));
      expect(hostEl.classes["ib-table--has-views"]).toBeTrue();
    });

    it("should apply active view changes to table state", fakeAsync(() => {
      /* Reset TestBed so we can reconfigure inside fakeAsync */
      TestBed.resetTestingModule();
      configureModule(IbTableWithViewGroupApp);
      const f = TestBed.createComponent(IbTableWithViewGroupApp);
      const c: IbTable = f.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      f.detectChanges();
      // flush filter.initialized + the two setTimeouts (dsInit, viewInit)
      tick();
      f.detectChanges();

      const host = c.viewHost as IbTableViewsHostStub;
      expect(c.dataSource.view).toBe(host);

      // Spy on store dispatch to verify handleViewChange was called
      const store = TestBed.inject(MockStore);
      spyOn(store, "dispatch").and.callThrough();

      host.emitActiveViewChanged({
        filter: {},
        pageSize: 50,
        aggregatedColumns: { amount: "sum" },
        sort: { active: "name", direction: "asc" },
        viewId: "test-view-1",
      });

      tick();
      f.detectChanges();

      // handleViewChange in data source applies pageSize + aggregatedColumns synchronously,
      // then dispatches a urlState handleViewChange action
      expect(store.dispatch).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: urlStateActions.handleViewChange.type,
          params: jasmine.objectContaining({
            view: "test-view-1",
            pageSize: 50,
          }),
        })
      );

      // Data source state is updated by handleViewChange
      expect(c.dataSource.aggregatedColumns).toEqual({ amount: "sum" });
    }));

    it("should forward toolbar portals from views host", async () => {
      // Wait for viewInit to complete
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const host = component.viewHost as IbTableViewsHostStub;
      const portalCount = host.toolbarPortals.length;

      // actionPortals contains [hideFilterAction portal, ...host.toolbarPortals]
      expect(component.actionPortals.length).toBe(1 + portalCount);
    });

    // These tests exercise IbTableViewGroup internals (view-list, dialogs, etc.)
    // and should be moved to table-view-group.component.spec.ts
    xdescribe("view management (requires IbViewModule)", () => {
      it("should create a view", async () => {
        const addViewButton = await loader.getHarness(
          MatButtonHarness.with({
            ancestor: "ib-view-list",
            variant: "icon",
          })
        );
        await addViewButton.click();

        hostFixture.detectChanges();
        await hostFixture.whenStable();

        const dialog = await loader.getHarness(MatDialogHarness);
        expect(dialog).toBeTruthy();
        const input = await loader.getHarness(MatInputHarness);
        await input.setValue("green view");

        const confirm = await loader.getHarness(
          MatButtonHarness.with({
            text: "shared.ibTableView.add",
          })
        );
        expect(confirm).toBeTruthy();
        await confirm.click();

        hostFixture.detectChanges();
        await hostFixture.whenStable();

        const views = await loader.getAllHarnesses(
          MatButtonHarness.with({
            ancestor: "ib-view-list",
          })
        );
        expect(views.length).toBe(2);
      });

      //DEVK-346 this should be fixed
      xit("should save view", fakeAsync(async () => {
        component.filter.form.patchValue({ color: ["green"] });
        component.filter.update();
        expect(component.viewHost.dirty).toBeTruthy();

        tick(1);
        const save = await loader.getHarness(
          MatButtonHarness.with({
            ancestor: ".ib-table__toolbar__actions",
            variant: "icon",
            text: /save/,
          })
        );
        await save.click();

        const dialog = await loader.getHarness(MatDialogHarness);
        expect(dialog).toBeTruthy();
        await hostFixture.whenStable();
        const input = await dialog.getHarness(MatInputHarness);
        await input.setValue("green view");

        const confirm = await dialog.getHarness(
          MatButtonHarness.with({
            text: "shared.ibTableView.add",
          })
        );
        await confirm.click();

        const views = await loader.getAllHarnesses(
          MatButtonHarness.with({
            ancestor: "ib-view-list",
          })
        );
        expect(views.length - 1).toBe(2);
      }));
    });
  });

  describe("with export", () => {
    let fixture: ComponentFixture<IbTableWithExport>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(() => {
      fixture = createComponent(IbTableWithExport);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      fixture.detectChanges();
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
          variant: "icon",
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

      expect(exportSpy).toHaveBeenCalledWith(
        component.dataSource.data,
        component.tableName,
        "ib"
      );
    });

    //DEVK-346 this should be fixed
    xit("should export current page", async () => {
      setTimeout(async () => {

        const exportSpy = spyOn(component.exportService, "export");
        const exportButton = await loader.getHarness(
          MatButtonHarness.with({
            ancestor: ".ib-table__toolbar__actions",
            variant: "icon",
          })
        );
        await exportButton.click();
        const dialog = await loader.getHarness(MatDialogHarness);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(dialog).toBeTruthy();
        const [_, __, option] = await dialog.getAllHarnesses(
          MatRadioButtonHarness
        );
        await option.check();
        const confirm = await dialog.getHarness(
          MatButtonHarness.with({
            text: "shared.ibTable.export",
          })
        );
        await confirm.click();
        fixture.detectChanges();

        expect(exportSpy).toHaveBeenCalledWith(
          component.dataSource.data.slice(0, 5),
          component.tableName,
          "ib"
        );
      });
    });

    it("should export selected rows", fakeAsync(async () => {

      const exportSpy = spyOn(component.exportService, "export");

      component.selectionColumn.selection.select(
        ...component.dataSource.data.slice(0, 2)
      );

      const exportButton = await loader.getHarness(
        MatButtonHarness.with({
          ancestor: ".ib-table__toolbar__actions",
          variant: "icon",
        })
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(dialog).toBeTruthy();
    }));
  });

  describe("with export transformer", () => {
    let fixture: ComponentFixture<IbTableWithExportTransformer>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(() => {
      fixture = createComponent(IbTableWithExportTransformer);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
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
          variant: "icon",
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

      const expectedData = component.dataSource.data.map((e: any) => ({
        ...e,
        created_at: e.created_at.getTime(),
        updated_at: e.updated_at.getTime(),
      }));

      expect(exportSpy).toHaveBeenCalledWith(
        expectedData,
        component.tableName,
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
      ).componentInstance;
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should apply", async () => {
      const dataSource = component.dataSource as IbTableDataSource<any>;
      const sort = await loader.getHarness(MatSortHarness);
      const [_, number] = await sort.getSortHeaders();
      let active = await sort.getActiveHeader();
      expect(active).toBeNull();

      await number.click();

      active = await sort.getActiveHeader();
      let direction = await number.getSortDirection();
      expect(await active.getLabel()).toEqual(await number.getLabel());

      expect(direction).toBe("asc");

      await number.click();
      direction = await number.getSortDirection();
      expect(direction).toBe("desc");

      const amountData = dataSource
        ._orderData(dataSource.filteredData)
        .map((i) => i.amount);
      expect(amountData).toEqual([20, 10]);
    });
  });

  describe("with aggregate", () => {
    let fixture: ComponentFixture<IbTableWithAggregate>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(() => {
      fixture = createComponent(IbTableWithAggregate);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should apply an aggregate function", async () => {
      const ibAggregate = fixture.debugElement.query(
        By.directive(IbAggregateCell)
      ).componentInstance;

      expect(ibAggregate).toBeTruthy();
      const footerLoader = await loader.getChildLoader("ib-aggregate");
      const button = await footerLoader.getHarness(MatButtonHarness);
      await button.click();
      const functionMenu = await footerLoader.getHarness(MatMenuHarness);
      await functionMenu.clickItem({ text: "shared.aggregate.sum.label" });
      expect(ibAggregate.result.currentPage).toBe(30);

      await functionMenu.clickItem({ text: "shared.aggregate.avg.label" });
      expect(ibAggregate.result.currentPage).toBe(15);
    });
  });
});

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
      EffectsModule.forRoot([]),
      RouterTestingModule.withRoutes([])
    ],
    providers: [
      provideStore(),
      provideMockStore(),
      { provide: MatSnackBar, useValue: { open: () => { } } },
      IbTableUrlService,
      UrlStateEffects
    ],
  }).compileComponents();
}

function createComponent<T>(type: Type<T>): ComponentFixture<T> {
  configureModule(type);

  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

@Component({
  template: `
    <ib-kai-table [data]="data" [displayedColumns]="['name', 'color', 'price']">
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
    <ib-kai-table [data]="data" [displayedColumns]="['name']">
      <ib-text-column name="name"></ib-text-column>
      <ng-template ibKaiRowGroup let-row="row">
        row data: {{ row | json }}
      </ng-template>
    </ib-kai-table>
  `,
  standalone: false
})
class IbTableWithRowGroupApp {
  data = [{ name: "alice" }];
}

@Injectable()
class IbTestDataSource extends IbTableRemoteDataSource<any> {
  fetchData(
    sort: MatSort,
    page: MatPaginator,
  ): Observable<IbFetchDataResponse<any>> {
    return timer(1).pipe(map(() => ({
      data: [{ name: "alice" }],
      totalCount: 1,
    })));
  }
}

@Component({
  template: `
    <ib-kai-table [dataSource]="dataSource" [displayedColumns]="['name']">
      <ib-filter>
        <ib-text-filter name="name">Name</ib-text-filter>
      </ib-filter>
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
  standalone: false
})
class IbTableWithRemoteDataApp {
  dataSource = new IbTestDataSource();
}

@Component({
  selector: 'ib-test-views-host',
  template: '',
  providers: [{ provide: IbTableViewsHost, useExisting: IbTestViewsHostComponent }],
  standalone: false
})
class IbTestViewsHostComponent extends IbTableViewsHostStub {}

@Component({
  template: `
    <ib-kai-table
      tableName="employees"
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
  standalone: false
})
class IbTableWithViewGroupApp {
  data = [
    { name: "alice", color: "peach" },
    { name: "bob", color: "green" },
  ];
}

class IbStubExportProvider implements IbDataExportProvider {
  format = "ib";
  label = "inobeta";
  export(data: any[], filename: string): void { }
}

@Component({
  template: `
    <ib-kai-table
      tableName="employees"
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

@Component({
  template: `
    <ib-kai-table
      tableName="employees"
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
      [data]="data"
      [displayedColumns]="['name', 'amount', 'createdAt']"
    >
      <ib-text-column name="name" [aggregate]="false"></ib-text-column>
      <ib-number-column name="amount" sort></ib-number-column>
      <ib-date-column name="createdAt" sort></ib-date-column>
      <ib-column ib-action-column>
        <section *ibCellDef="let element">{{ element.amount }}</section>
      </ib-column>
    </ib-kai-table>
  `,
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
    <ib-kai-table [data]="data" [displayedColumns]="['name', 'amount']">
      <ib-text-column name="name"></ib-text-column>
      <ib-number-column name="amount" aggregate></ib-number-column>
    </ib-kai-table>
  `,
  standalone: false
})
class IbTableWithAggregate {
  data = [
    { name: "alice", amount: 10 },
    { name: "bob", amount: 20 },
  ];
}
