import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule } from "@angular/common";
import { Component, Type } from "@angular/core";
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
import { MatSortModule } from "@angular/material/sort";
import { MatSortHarness } from "@angular/material/sort/testing";
import { MatTableHarness } from "@angular/material/table/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { throwError } from "rxjs";
import {
  IbDataExportModule,
  IbDataExportService,
  OVERRIDE_EXPORT_FORMATS,
} from "../data-export";
import { IbDataExportProvider } from "../data-export/provider";
import { IbFilterModule } from "../kai-filter";
import { IbViewModule } from "../views";
import { IbTableActionModule } from "./action";
import { IbAggregateCell } from "./cells";
import { IbRemoteTableDataSource } from "./remote-data-source";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";
import { IbTableDataSource } from "./table-data-source";

describe("IbTable", () => {
  describe("with IbTableDataSource", () => {
    let host: IbTableApp;
    let fixture: ComponentFixture<IbTableApp>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(waitForAsync(() => {
      configureModule(IbTableApp);
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(IbTableApp);
      host = fixture.componentInstance;
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should create", async () => {
      const table = await loader.getHarness(MatTableHarness);
      const rows = await table.getRows();
      expect(component).toBeTruthy();
      expect(rows.length).toBe(1);
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
      const fixture = createComponent(IbTableWithIbDataSourceApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      component.dataSource.refresh();
      tick(1);
      expect(component).toBeTruthy();
    }));

    it("should create with empty constructor", () => {
      const dataSource = new IbRemoteTableDataSource();
      expect(dataSource).toBeTruthy();
      expect(dataSource.data).toEqual([]);
    });

    it("should reset to empty array with non array types", () => {
      const dataSource = new IbRemoteTableDataSource([{ name: "alice" }]);
      expect(dataSource).toBeTruthy();
      expect(dataSource.data).toEqual([{ name: "alice" }]);
      dataSource.data = null;
      expect(dataSource.data).toEqual([]);
      dataSource.data = [{ name: "rabbit" }];
      expect(dataSource.data).toEqual([{ name: "rabbit" }]);
    });

    it("should show error on exception", fakeAsync(() => {
      const fixture = createComponent(IbTableWithIbDataSourceApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      component.dataSource.fetchData = () => throwError("oh no");
      component.dataSource.refresh();
      tick(1);
      fixture.detectChanges();
      expect(component.state === "http_error").toBeTruthy();
    }));
  });

  describe("with rowgroup", () => {
    it("should render", async () => {
      const fixture = createComponent(IbTableWithRowGroupApp);
      const rowGroup = fixture.nativeElement.querySelectorAll(
        ".ib-table-group-detail-row"
      );
      expect(rowGroup.length).toBeTruthy();
    });
  });

  describe("with IbView", () => {
    let fixture: ComponentFixture<IbTableWithViewGroupApp>;
    let component: IbTable;
    let loader: HarnessLoader;

    beforeEach(() => {
      fixture = createComponent(IbTableWithViewGroupApp);
      component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should create a view", async () => {
      const addViewButton = await loader.getHarness(
        MatButtonHarness.with({
          ancestor: "ib-view-list",
          variant: "icon",
        })
      );
      await addViewButton.click();

      fixture.detectChanges();
      await fixture.whenStable();

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

      fixture.detectChanges();
      await fixture.whenStable();

      const views = await loader.getAllHarnesses(
        MatButtonHarness.with({
          ancestor: "ib-view-list",
        })
      );
      expect(views.length - 1).toBe(2);
    });

    it("should pin a view", async () => {
      const addViewButton = await loader.getHarness(
        MatButtonHarness.with({
          ancestor: "ib-view-list",
          variant: "icon",
        })
      );
      await addViewButton.click();

      const dialog = await loader.getHarness(MatDialogHarness);
      await fixture.whenStable();
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

      const pinView = spyOn(
        component.view.viewService,
        "pinView"
      ).and.callThrough();
      const unpinView = spyOn(
        component.view.viewService,
        "unpinView"
      ).and.callThrough();
      component.view.handlePinView({
        view: component.view.activeView,
        pinned: true,
      });
      expect(pinView).toHaveBeenCalledWith(component.view.activeView);
      component.view.handlePinView({
        view: component.view.activeView,
        pinned: false,
      });
      expect(unpinView).toHaveBeenCalledWith(component.view.activeView);
    });

    it("should save view", fakeAsync(async () => {
      component.filter.form.patchValue({ color: ["green"] });
      component.filter.update();
      expect(component.view.dirty).toBeTruthy();

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
      await fixture.whenStable();
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
      const exportSpy = spyOn(component.exportAction.exportService, "export");
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

    it("should export current page", async () => {
      const exportSpy = spyOn(component.exportAction.exportService, "export");
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

    it("should export selected rows", fakeAsync(async () => {
      const exportSpy = spyOn(component.exportAction.exportService, "export");

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
      const [_, option, __] = await dialog.getAllHarnesses(
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
        component.selectionColumn.selection.selected,
        component.tableName,
        "ib"
      );
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
      const exportSpy = spyOn(component.exportAction.exportService, "export");
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
      expect(ibAggregate.result.currentPage).toBe("30");

      await functionMenu.clickItem({ text: "shared.aggregate.avg.label" });
      expect(ibAggregate.result.currentPage).toBe("15");
    });
  });
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [type],
    imports: [
      CommonModule,
      IbKaiTableModule,
      IbTableActionModule,
      IbFilterModule,
      IbViewModule,
      MatSortModule,
      IbDataExportModule,
      NoopAnimationsModule,
      StoreModule.forRoot({}),
      TranslateModule.forRoot({
        extend: true,
      }),
    ],
    providers: [
      { provide: MatSnackBar, useValue: { open: () => {} } },
      // IbSumAggregateProvider,
      // IbAverageAggregateProvider,
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
        <ib-text-filter ibTableColumnName="name">Name</ib-text-filter>
        <ib-tag-filter ibTableColumnName="color">Name</ib-tag-filter>
        <ib-number-filter ibTableColumnName="price">Name</ib-number-filter>
      </ib-filter>
      <ib-selection-column></ib-selection-column>
      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="color"></ib-text-column>
      <ib-number-column name="price"></ib-number-column>
    </ib-kai-table>
  `,
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
})
class IbTableWithRowGroupApp {
  data = [{ name: "alice" }];
}

@Component({
  template: `
    <ib-kai-table [dataSource]="dataSource" [displayedColumns]="['name']">
      <ib-filter></ib-filter>
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
})
class IbTableWithIbDataSourceApp {
  dataSource = new IbRemoteTableDataSource<any>([{ name: "alice" }]);
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
        <ib-tag-filter ibTableColumnName="color">Color</ib-tag-filter>
      </ib-filter>

      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="color"></ib-text-column>
    </ib-kai-table>
  `,
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
  export(data: any[], filename: string): void {}
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
        <ib-table-data-export-action></ib-table-data-export-action>
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
        <ib-table-data-export-action></ib-table-data-export-action>
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
})
class IbTableWithSort {
  data = [
    { name: "alice", amount: 10, createdAt: new Date() },
    { name: "bob", amount: 20, createdAt: new Date() },
  ];
}

@Component({
  template: `
    <ib-kai-table
      [data]="data"
      [displayedColumns]="['name', 'amount']"
    >
      <ib-text-column name="name"></ib-text-column>
      <ib-number-column name="amount" aggregate></ib-number-column>
    </ib-kai-table>
  `,
})
class IbTableWithAggregate {
  data =[
    { name: "alice", amount: 10 },
    { name: "bob", amount: 20 },
  ];
}
