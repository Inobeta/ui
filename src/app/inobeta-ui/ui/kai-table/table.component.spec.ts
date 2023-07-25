import { PortalModule } from "@angular/cdk/portal";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule } from "@angular/common";
import { Component, Type } from "@angular/core";
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from "@angular/core/testing";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTableHarness } from "@angular/material/table/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { throwError } from "rxjs";
import { IbToolTestModule } from "../../tools/tools-test.module";
import { IbFilterModule } from "../kai-filter";
import {
  useColumn,
  useDateColumn,
  useNumberColumn,
  useTranslateColumn
} from "./cells";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbSelectionColumn } from "./selection-column";
import { IbDataSource } from "./table-data-source";
import { IbTable } from "./table.component";
import { IbKaiTableState } from "./table.types";

fdescribe("IbTable", () => {
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
      expect(column.cell({ updated_at: d })).toBe("24/07/2023 15:14 GMT+2");
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

    it("should show error on exception", fakeAsync(() => {
      const fixture = createComponent(IbTableWithIbDataSourceApp);
      const component = fixture.debugElement.query(
        By.directive(IbTable)
      ).componentInstance;
      component.dataSource.fetchData = () => throwError('oh no')
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
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [IbTable, IbKaiRowGroupDirective, IbSelectionColumn, type],
    imports: [
      CommonModule,
      PortalModule,
      BrowserAnimationsModule,
      IbToolTestModule,
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatIconModule,
      MatCheckboxModule,
      IbFilterModule,
      TranslateModule.forRoot({
        extend: true,
      }),
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
      </ib-filter>
      <ib-selection-column></ib-selection-column>
    </ib-kai-table>
  `,
})
class IbTableApp {
  filterValue = { color: ["black"] };
  dataSource = new MatTableDataSource<any>([
    { name: "alice", color: "white" },
    { name: "bob", color: "black" },
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
