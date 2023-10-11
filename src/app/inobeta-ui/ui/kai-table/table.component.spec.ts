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
import { MatRadioButtonHarness } from "@angular/material/radio/testing";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSortHarness } from "@angular/material/sort/testing";
import { MatTableDataSource } from "@angular/material/table";
import { MatTableHarness } from "@angular/material/table/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { throwError } from "rxjs";
import { IbDataExportModule, IbDataExportService, OVERRIDE_EXPORT_FORMATS } from "../data-export";
import { IbDataExportProvider } from "../data-export/provider";
import { IbFilterModule } from "../kai-filter";
import { IbViewModule } from "../views";
import { IbTableActionModule } from "./action";
import { IbAverageAggregateProvider, IbSumAggregateProvider } from "./cells";
import { IbDataSource } from "./table-data-source";
import { IbTable } from "./table.component";
import { IbKaiTableModule } from "./table.module";
import { IbKaiTableState } from "./table.types";
import { MatSortModule } from "@angular/material/sort";

describe("IbTable", () => {
  describe("with MatTableDataSource", () => {
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

  describe("with IbDataSource", () => {
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
      const dataSource = new IbDataSource();
      expect(dataSource).toBeTruthy();
      expect(dataSource.data).toEqual([]);
    });

    it("should reset to empty array with non array types", () => {
      const dataSource = new IbDataSource([{ name: "alice" }]);
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
      expect(component.state === IbKaiTableState.HTTP_ERROR).toBeTruthy();
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

  fdescribe("with sort", () => {
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

    it("should apply asc order", async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenRenderingDone();
      // tick(1000);
      const sort = await loader.getHarness(MatSortHarness);
      console.log(await sort.getSortHeaders());
      const active = await sort.getActiveHeader();
      console.log(component.dataSource.sort.sortables);
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
      IbSumAggregateProvider,
      IbAverageAggregateProvider,
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
    <ib-kai-table [dataSource]="dataSource">
      <ib-filter [value]="filterValue">
        <ib-text-filter ibTableColumnName="name">Name</ib-text-filter>
        <ib-tag-filter ibTableColumnName="color">Name</ib-tag-filter>
        <ib-number-filter ibTableColumnName="price">Name</ib-number-filter>
      </ib-filter>
      <ib-selection-column></ib-selection-column>
      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="color"></ib-text-column>
      <ib-number-column name="price" sort aggregate></ib-number-column>
    </ib-kai-table>
  `,
})
class IbTableApp {
  filterValue = { color: ["black"] };
  dataSource = new MatTableDataSource<any>([
    { name: "alice", color: "white", price: 10 },
    { name: "bob", color: "black", price: 12 },
  ]);
}

@Component({
  template: `
    <ib-kai-table [dataSource]="dataSource">
      <ib-text-column name="name"></ib-text-column>
      <ng-template ibKaiRowGroup let-row="row">
        row data: {{ row | json }}
      </ng-template>
    </ib-kai-table>
  `,
})
class IbTableWithRowGroupApp {
  dataSource = new MatTableDataSource<any>([{ name: "alice" }]);
}

@Component({
  template: `
    <ib-kai-table [dataSource]="dataSource">
      <ib-filter></ib-filter>
      <ib-text-column name="name"></ib-text-column>
    </ib-kai-table>
  `,
})
class IbTableWithIbDataSourceApp {
  dataSource = new IbDataSource<any>([{ name: "alice" }]);
}

@Component({
  template: `
    <ib-kai-table tableName="employees" [dataSource]="dataSource">
      <ib-table-view-group></ib-table-view-group>
      <ib-filter>
        <ib-tag-filter ibTableColumnName="color">Name</ib-tag-filter>
      </ib-filter>

      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="tag"></ib-text-column>
    </ib-kai-table>
  `,
})
class IbTableWithViewGroupApp {
  dataSource = new MatTableDataSource<any>([
    { name: "alice", color: "peach" },
    { name: "bob", color: "green" },
  ]);
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
      [dataSource]="dataSource"
      [tableDef]="{ paginator: { pageSize: 5 } }"
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
  dataSource = new MatTableDataSource<any>([
    { name: "alice", color: "blue" },
    { name: "rabbit", color: "white" },
    { name: "queen", color: "red" },
    { name: "cat", color: "black" },
    { name: "rook", color: "purple" },
    { name: "knight", color: "brown" },
    { name: "king", color: "green" },
  ]);
}

@Component({
  template: `
    <ib-kai-table [dataSource]="dataSource">
      <ib-text-column name="name" [aggregate]="false"></ib-text-column>
      <ib-number-column
        name="amount"
        [sort]="true"
        aggregate
      ></ib-number-column>
      <ib-column name="cust" [sort]="true">
        <section *ibCellDef="let element">{{ element.amount }}</section>
      </ib-column>
    </ib-kai-table>
  `,
})
class IbTableWithSort {
  dataSource = new MatTableDataSource<any>([
    { name: "alice", amount: 10 },
    { name: "bob", amount: 20 },
  ]);
}
