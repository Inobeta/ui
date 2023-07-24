import { PortalModule } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { Component, Provider, Type } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from "@angular/core/testing";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { IbToolTestModule } from "../../tools/tools-test.module";
import { IbFilterModule } from "../kai-filter";
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

fdescribe("IbTable", () => {
  describe("with MatTableDataSource", () => {
    let host: IbTableApp;
    let fixture: ComponentFixture<IbTableApp>;
    let component: IbTable;

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
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should select column", () => {
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
      tick(1)
      expect(component).toBeTruthy();
    }));
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
      IbFilterModule,
      TranslateModule.forRoot({
        extend: true,
      }),
    ],
  }).compileComponents();
}

function createComponent<T>(
  type: Type<T>,
  providers: Provider[] = []
): ComponentFixture<T> {
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
      </ib-filter>
      <ib-selection-column></ib-selection-column>
      <ng-template ibKaiRowGroup let-row="row">
        row data: {{row | json}}
      </ng-template>
    </ib-kai-table>
  `,
})
class IbTableApp {
  filterValue = {};
  dataSource = new MatTableDataSource<any>([
    { name: "alice", description: "test.test" },
    { name: "bob", description: "test.test" },
  ]);
  columns = [useColumn("name", "name"), useTranslateColumn("description")];
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
