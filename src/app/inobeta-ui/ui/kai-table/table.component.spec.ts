import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule } from "@angular/common";
import { Component, Injectable, Type, Input, Output, EventEmitter } from "@angular/core";
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
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { TranslateModule } from "@ngx-translate/core";
import { Observable, Subject, map, throwError, timer } from "rxjs";
import {
  IbDataExportModule,
  IbDataExportService,
  OVERRIDE_EXPORT_FORMATS
} from "../data-export";
import { IbDataExportProvider } from "../data-export/provider";
import { IbFilterModule } from "../kai-filter";
import { IbTableActionModule } from "./action";
import { IbAggregateCell } from "./cells";
import {
  IbFetchDataResponse,
  IbTableRemoteDataSource,
} from "./remote-data-source";
import { UrlStateEffects } from "./store/url-state/effects";
import { IbTableDataSource } from "./table-data-source";
import { IbTableUrlService } from "./table-url.service";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";

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

  // Tests related to IbView removed

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
  declarations: [type, IbViewGroupStub],
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
      provideMockStore({
        initialState: {
          ibKaiTable: {
            tables: []
          }
        }
      }),
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
  template: `
    <ib-kai-table
      tableName="employees"
      [data]="data"
      [displayedColumns]="['name', 'color']"
    >
      <ib-table-view-group></ib-table-view-group>
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

@Component({
  selector: "ib-view-group, ib-table-view-group",
  template: "",
  standalone: false,
})
class IbViewGroupStub {
  @Input() groupName: string = "";
  @Input() componentType: string = "";
  @Input() stateAccessor: () => unknown = () => ({});
  @Input() initialViewId: string | null = null;
  @Input() stateChanges$: Observable<unknown> | null = null;
  @Output() ibViewChanged = new EventEmitter<any>();
}


describe("with IbTableViewGroup", () => {
  it("applyViewToTable({ initial: true, data: {...} }) applies data and does NOT call setViewState", fakeAsync(() => {
    configureModule(IbTableWithViewGroupApp);
    const tableUrl = TestBed.inject(IbTableUrlService);
    const setSpy = spyOn(tableUrl, "setViewState");

    const fixture = TestBed.createComponent(IbTableWithViewGroupApp);
    fixture.detectChanges();
    const component = fixture.debugElement.query(By.directive(IbTable)).componentInstance;

    // apply initial view (should not call setViewState)
    component.applyViewToTable({ initial: true, id: "v-initial", data: { pageSize: 5 } } as any);
    expect(component.dataSource.paginator.pageSize).toBe(5);
    expect(setSpy).not.toHaveBeenCalled();
  }));

  it("applyViewToTable({ initial: false, data: {...} }) applies data AND calls setViewState", fakeAsync(() => {
    configureModule(IbTableWithViewGroupApp);
    const tableUrl = TestBed.inject(IbTableUrlService);
    const setSpy = spyOn(tableUrl, "setViewState");

    const fixture = TestBed.createComponent(IbTableWithViewGroupApp);
    fixture.detectChanges();
    const component = fixture.debugElement.query(By.directive(IbTable)).componentInstance;

    component.applyViewToTable({ initial: false, id: "v-2", data: { pageSize: 3 } } as any);
    expect(component.dataSource.paginator.pageSize).toBe(3);
    expect(setSpy).toHaveBeenCalledWith(component.tableName, "v-2", jasmine.any(Object));
  }));

  it("getCurrentTableState() returns filter, pageSize, aggregatedColumns, sort", () => {
    configureModule(IbTableWithViewGroupApp);
    const fixture = TestBed.createComponent(IbTableWithViewGroupApp);
    fixture.detectChanges();
    const component = fixture.debugElement.query(By.directive(IbTable)).componentInstance;

    // set some internal values
    component.dataSource.aggregatedColumns = { foo: true } as any;
    component.dataSource.sort = component.sort;
    component.sort.active = "name";
    component.sort.direction = "asc";
    component.paginator.pageSize = 11;

    const state: any = component.getCurrentTableState();
    expect(state.pageSize).toBe(11);
    expect(state.aggregatedColumns).toEqual({ foo: true });
    expect(state.sort).toBeDefined();
    expect(state.sort.active).toBe("name");
    expect(state.sort.direction).toBe("asc");
    expect(state.filter).toBeDefined();
  });

  it("viewIdFromUrl() is non-null when URL has ibview param set", () => {
    configureModule(IbTableWithViewGroupApp);
    const tableUrl = TestBed.inject(IbTableUrlService);
    spyOn(tableUrl, "getActiveView").and.returnValue("from-url");

    const fixture = TestBed.createComponent(IbTableWithViewGroupApp);
    fixture.detectChanges();
    const component = fixture.debugElement.query(By.directive(IbTable)).componentInstance;

    expect(component.viewIdFromUrl()).toBe("from-url");
  });

  it("URL empty + Redux cached state -> paginator.pageSize receives cached value", () => {
    configureModule(IbTableWithViewGroupApp);
    const mockStore = TestBed.inject(MockStore);
    // Use setState (factory selector ibTableSelectLastQueryStringRaw creates a new instance
    // each call so overrideSelector won't match — set actual state instead)
    mockStore.setState({
      ibKaiTable: {
        tables: [{ tableName: "employees", pageSize: 7 }]
      }
    });

    const fixture = TestBed.createComponent(IbTableWithViewGroupApp);
    fixture.detectChanges();
    const component = fixture.debugElement.query(By.directive(IbTable)).componentInstance;

    // tableDef should be initialized from cached store value
    expect(component.tableDef.paginator.pageSize).toBe(7);
  });
});
