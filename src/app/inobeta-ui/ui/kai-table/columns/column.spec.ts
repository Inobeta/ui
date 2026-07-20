import { Component } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { IbCellDef } from "../cells";
import { IbSortHeader } from "../sort-header";
import { IbColumn } from "./column";
import { IB_TABLE } from "../tokens";

/**
 * Tests for IbColumn signal API (name, headerText, dataAccessor, sort, sticky,
 * aggregate, cellDef), MatColumnDef registration, mobileDataRenderer, and
 * programmatic signal invocation.
 */

// ===========================================================================
// Host with signal bindings — no IB_TABLE
// ===========================================================================

@Component({
  template: `
    <ib-column
      [name]="colName"
      [headerText]="colHeader"
      [dataAccessor]="colAccessor"
      [sortingDataAccessor]="colSortAccessor"
      [filterDataAccessor]="colFilterAccessor"
      [sort]="colSort"
      [sticky]="colSticky"
      [stickyEnd]="colStickyEnd"
      [aggregate]="colAggregate"
      [ib-action-column]="colIsAction"
    >
      <ng-template *ibCellDef="let data">{{ data?.field }}</ng-template>
    </ib-column>
  `,
  standalone: false,
})
class ColumnHostComponent {
  colName = "testCol";
  colHeader: string | undefined = "Test Header";
  colAccessor: ((data: any, name: string) => string | number) | undefined = undefined;
  colSortAccessor: ((data: any, name: string) => string | number) | undefined = undefined;
  colFilterAccessor: ((data: any, name: string) => string | number) | undefined = undefined;
  colSort = false;
  colSticky = false;
  colStickyEnd = false;
  colAggregate = false;
  colIsAction = false;
}

// ===========================================================================
// Host with a mock IB_TABLE for registration lifecycle tests
// ===========================================================================

@Component({
  template: `
    <ib-column [name]="'regCol'" [headerText]="'Reg'"></ib-column>
  `,
  standalone: false,
  providers: [
    {
      provide: IB_TABLE,
      useValue: {
        matTable: {
          addColumnDef: () => {},
          removeColumnDef: () => {},
        },
        dataSource: {},
        displayedColumns: [],
        sort: null,
      },
    },
  ],
})
class ColumnWithTableHostComponent {}

describe("IbColumn", () => {
  describe("signal API — standalone (no IB_TABLE)", () => {
    let fixture: ComponentFixture<ColumnHostComponent>;
    let host: ColumnHostComponent;
    let component: IbColumn<any>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ColumnHostComponent, IbCellDef],
        imports: [NoopAnimationsModule, MatTableModule, MatSortModule, IbColumn, IbSortHeader],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ColumnHostComponent);
      host = fixture.componentInstance;
      component = fixture.debugElement.query(
        By.directive(IbColumn)
      ).componentInstance;
      fixture.detectChanges();
    });

    // --- Requirement 1: name/header/accessor/sort/sticky signals ---

    it("should read the name model signal", () => {
      expect(component.name()).toBe("testCol");
      component.name.set("renamed");
      fixture.detectChanges();
      expect(component.name()).toBe("renamed");
    });

    it("should read the headerText model signal", () => {
      expect(component.headerText()).toBe("Test Header");
      component.headerText.set("Overridden");
      fixture.detectChanges();
      expect(component.headerText()).toBe("Overridden");
    });

    it("should create a default header text from column name when headerText is undefined", () => {
      expect(component._createDefaultHeaderText()).toBe("TestCol");
    });

    it("should use the provided dataAccessor function", () => {
      const accessor = (data: any) => data.custom;
      host.colAccessor = accessor as any;
      fixture.detectChanges();
      expect(component.dataAccessor()({ custom: 42 }, "custom")).toBe(42);
    });

    it("should default dataAccessor to property lookup on the data object", () => {
      const result = component.dataAccessor()({ foo: "bar" }, "foo");
      expect(result).toBe("bar");
    });

    it("should default sortingDataAccessor to dataAccessor", () => {
      expect(component.sortingDataAccessor()).toBe(component.dataAccessor());
    });

    it("should default filterDataAccessor to dataAccessor", () => {
      expect(component.filterDataAccessor()).toBe(component.dataAccessor());
    });

    it("should provide a custom sortingDataAccessor when set", () => {
      const sortFn = () => "sorted" as any;
      host.colSortAccessor = sortFn as any;
      fixture.detectChanges();
      expect(component.sortingDataAccessor()).toBe(sortFn as any);
    });

    it("should provide a custom filterDataAccessor when set", () => {
      const filterFn = () => "filtered" as any;
      host.colFilterAccessor = filterFn as any;
      fixture.detectChanges();
      expect(component.filterDataAccessor()).toBe(filterFn as any);
    });

    // --- signal invocation (Requirement 8) ---

    it("should read sort input as a boolean signal", () => {
      expect(component.sortInput()).toBeFalse();
      host.colSort = true;
      fixture.detectChanges();
      expect(component.sortInput()).toBeTrue();
    });

    it("should read sticky input as a boolean signal", () => {
      expect(component.stickyInput()).toBeFalse();
      host.colSticky = true;
      fixture.detectChanges();
      expect(component.stickyInput()).toBeTrue();
    });

    it("should read stickyEnd input as a boolean signal", () => {
      expect(component.stickyEndInput()).toBeFalse();
      host.colStickyEnd = true;
      fixture.detectChanges();
      expect(component.stickyEndInput()).toBeTrue();
    });

    it("should read aggregate input as a boolean signal", () => {
      expect(component.aggregateInput()).toBeFalse();
      host.colAggregate = true;
      fixture.detectChanges();
      expect(component.aggregateInput()).toBeTrue();
    });

    it("should read isActionColumnInput as a boolean signal", () => {
      expect(component.isActionColumnInput()).toBeFalse();
      host.colIsAction = true;
      fixture.detectChanges();
      expect(component.isActionColumnInput()).toBeTrue();
    });

    // --- Requirement 2: ibCellDef contentChild query ---

    it("should query ibCellDef via contentChild", () => {
      const cellDef = component.ibCellDef();
      expect(cellDef).toBeTruthy();
      expect(cellDef.templateRef).toBeTruthy();
    });

    // --- Requirement 8: programmatic access to signal value ---

    it("should allow programmatic signal invocation to read the current sort value", () => {
      host.colSort = true;
      fixture.detectChanges();
      const sortValue = component.sortInput();
      expect(sortValue).toBeTrue();
      expect(typeof sortValue).toBe("boolean");
    });

    it("should expose columnDef via required viewChild", () => {
      expect(component.columnDef()).toBeTruthy();
      expect(component.columnDef().name).toBe("testCol");
    });

    it("should expose cell via required viewChild", () => {
      expect(component.cell()).toBeTruthy();
    });

    it("should expose headerCell via required viewChild", () => {
      expect(component.headerCell()).toBeTruthy();
    });

    it("should expose footerCell via required viewChild", () => {
      expect(component.footerCell()).toBeTruthy();
    });

    // --- mobileDataRenderer ---

    it("should render mobile data using dataAccessor", () => {
      const result = component.mobileDataRenderer({ field: "hello" }, "field");
      expect(result).toBe("hello");
    });

    it("should return empty string for null/undefined mobile data", () => {
      expect(component.mobileDataRenderer({}, "missing")).toBe("");
    });

    // --- Error on empty name ---

    it("should throw if column name is empty", () => {
      // The throw happens in ngOnInit via _createDefaultHeaderText, so we
      // need a fresh component where the name is empty before first CD.
      const freshFixture = TestBed.createComponent(ColumnHostComponent);
      freshFixture.componentInstance.colName = "";
      freshFixture.componentInstance.colHeader = undefined;
      expect(() => freshFixture.detectChanges()).toThrowError(
        "Table column must have a name."
      );
    });
  });

  // ===========================================================================
  // Table integration tests (IB_TABLE provided)
  // ===========================================================================

  describe("with table integration (IB_TABLE provided)", () => {
    let fixture: ComponentFixture<ColumnWithTableHostComponent>;
    let component: IbColumn<any>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ColumnWithTableHostComponent],
        imports: [NoopAnimationsModule, MatTableModule, MatSortModule, IbColumn, IbSortHeader],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ColumnWithTableHostComponent);
      component = fixture.debugElement.query(
        By.directive(IbColumn)
      ).componentInstance;
      fixture.detectChanges();
    });

    // --- Requirement 2: MatColumnDef registration/removal ---

    it("should register columnDef with the table on init", () => {
      const table = component._table;
      expect(table).toBeTruthy();
      expect(component.columnDef()).toBeTruthy();
      expect(component.columnDef().name).toBe("regCol");
    });

    it("should remove columnDef from the table on destroy", () => {
      const removeSpy = spyOn(component._table.matTable, "removeColumnDef");
      component.ngOnDestroy();
      expect(removeSpy).toHaveBeenCalledWith(component.columnDef());
    });

    it("should wire cell/headerCell/footerCell to columnDef during init", () => {
      expect(component.columnDef().cell).toBe(component.cell());
      expect(component.columnDef().headerCell).toBe(component.headerCell());
      expect(component.columnDef().footerCell).toBe(component.footerCell());
    });

    // --- matSort computed signal ---

    it("should compute matSort from the table's sort property", () => {
      expect(component.matSort()).toBeNull();
    });
  });
});
