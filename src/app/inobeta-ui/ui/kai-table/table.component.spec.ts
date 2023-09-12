import { PortalModule } from "@angular/cdk/portal";
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
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { MatIconModule } from "@angular/material/icon";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatRadioButtonHarness } from "@angular/material/radio/testing";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTableHarness } from "@angular/material/table/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { throwError } from "rxjs";
import { IbToolTestModule } from "../../tools/tools-test.module";
import { IbDataExportService, OVERRIDE_EXPORT_FORMATS } from "../data-export";
import { IbDataExportModule } from "../data-export/data-export.module";
import { IbDataExportProvider } from "../data-export/provider";
import { IbFilterModule } from "../kai-filter/filters.module";
import { IbToastModule } from "../toast/toast.module";
import { IbViewModule } from "../views/view.module";
import { IbTableActionModule } from "./action";
import {
  useColumn,
  useDateColumn,
  useNumberColumn,
  useTranslateColumn,
} from "./cells";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbSelectionColumn } from "./selection-column";
import { IbDataSource } from "./table-data-source";
import { IbTable } from "./table.component";
import { IbKaiTableState } from "./table.types";

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

    it("should create a text column", () => {
      const column = useColumn("sku");
      expect(column.columnDef === "sku").toBeTruthy();
      expect(column.cell({ sku: "TPS-1" })).toBe("TPS-1");
    });

    it("should create a date column", () => {
      const column = useDateColumn("updated_at");
      expect(column.columnDef === "updated_at").toBeTruthy();
      const d = new Date(1690204463 * 1000);
      expect(column.cell({ updated_at: d })).toContain("24/07/2023");
    });

    it("should create a number column", () => {
      const column = useNumberColumn("price");
      expect(column.columnDef === "price").toBeTruthy();
      expect(column.cell({ price: 1209.33 })).toBe("1.209,33");
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
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [IbTable, IbKaiRowGroupDirective, IbSelectionColumn, type],
    imports: [
      CommonModule,
      PortalModule,
      NoopAnimationsModule,
      IbToolTestModule,
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatIconModule,
      MatCheckboxModule,
      IbFilterModule,
      IbViewModule,
      IbToastModule,
      IbDataExportModule,
      IbTableActionModule,
      StoreModule.forRoot({}),
      TranslateModule.forRoot({
        extend: true,
      }),
    ],
    providers: [
      IbDataExportService,
      { provide: MatSnackBar, useValue: { open: () => {} } },
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
    <ib-kai-table [columns]="columns" [dataSource]="dataSource">
      <ib-filter [value]="filterValue">
        <ib-text-filter ibTableColumnName="name">Name</ib-text-filter>
        <ib-tag-filter ibTableColumnName="color">Name</ib-tag-filter>
        <ib-number-filter ibTableColumnName="price">Name</ib-number-filter>
      </ib-filter>
      <ib-selection-column></ib-selection-column>
    </ib-kai-table>
  `,
})
class IbTableApp {
  filterValue = { color: ["black"] };
  dataSource = new MatTableDataSource<any>([
    { name: "alice", color: "white", price: 10 },
    { name: "bob", color: "black", price: 12 },
  ]);
  columns = [useColumn("name", "name"), useTranslateColumn("color")];
}

@Component({
  template: `
    <ib-kai-table [columns]="columns" [dataSource]="dataSource">
      <ng-template ibKaiRowGroup let-row="row">
        row data: {{ row | json }}
      </ng-template>
    </ib-kai-table>
  `,
})
class IbTableWithRowGroupApp {
  dataSource = new MatTableDataSource<any>([{ name: "alice" }]);
  columns = [useColumn("name", "name")];
}

@Component({
  template: `
    <ib-kai-table [columns]="columns" [dataSource]="dataSource">
      <ib-filter></ib-filter>
    </ib-kai-table>
  `,
})
class IbTableWithIbDataSourceApp {
  dataSource = new IbDataSource<any>([{ name: "alice" }]);
  columns = [useColumn("name", "name")];
}

@Component({
  template: `
    <ib-kai-table
      tableName="employees"
      [columns]="columns"
      [dataSource]="dataSource"
    >
      <ib-table-view-group></ib-table-view-group>
      <ib-filter>
        <ib-tag-filter ibTableColumnName="color">Name</ib-tag-filter>
      </ib-filter>
    </ib-kai-table>
  `,
})
class IbTableWithViewGroupApp {
  dataSource = new MatTableDataSource<any>([
    { name: "alice", color: "peach" },
    { name: "bob", color: "green" },
  ]);
  columns = [useColumn("name", "name"), useColumn("color", "color")];
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
      [columns]="columns"
      [dataSource]="dataSource"
      [tableDef]="{ paginator: { pageSize: 5 } }"
    >
      <ib-table-action-group>
        <ib-table-data-export-action></ib-table-data-export-action>
      </ib-table-action-group>
      <ib-selection-column></ib-selection-column>
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
  columns = [useColumn("name", "name"), useColumn("color", "color")];
}
