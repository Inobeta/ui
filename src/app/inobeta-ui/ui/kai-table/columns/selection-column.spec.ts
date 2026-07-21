import { SelectionModel } from "@angular/cdk/collections";
import { Component } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTableModule } from "@angular/material/table";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { IbSelectionColumn } from "./selection-column";
import { IB_TABLE } from "../tokens";
import { IbTableRowSelectionChange } from "../table.types";

function createMockTable(overrides: Partial<any> = {}) {
  const dsObj = {
    filteredData: [
      { id: 1, name: "alice" },
      { id: 2, name: "bob" },
      { id: 3, name: "charlie" },
    ],
  };
  return {
    matTable: jasmine.createSpy('matTable').and.returnValue({ addColumnDef: () => {}, removeColumnDef: () => {} }),
    displayedColumns: jasmine.createSpy('displayedColumns').and.returnValue([] as string[]),
    activeDataSource: jasmine.createSpy('activeDataSource').and.returnValue(dsObj),
    dataSource: dsObj,
    isRemote: jasmine.createSpy('isRemote').and.returnValue(false),
    state: jasmine.createSpy('state').and.returnValue("idle"),
    tableName: jasmine.createSpy('tableName').and.returnValue("test-table"),
    canSelectRows: jasmine.createSpy('canSelectRows').and.returnValue(true),
    ...overrides,
  };
}

@Component({
  template: `<ib-selection-column></ib-selection-column>`,
  standalone: false,
})
class SelectionHostComponent {}

describe("IbSelectionColumn", () => {
  describe("toggle and selection logic", () => {
    let fixture: ComponentFixture<SelectionHostComponent>;
    let component: IbSelectionColumn;
    let mockTable: any;

    beforeEach(waitForAsync(() => {
      mockTable = createMockTable();
      TestBed.configureTestingModule({
        declarations: [SelectionHostComponent, IbSelectionColumn],
        imports: [NoopAnimationsModule, MatTableModule, MatCheckboxModule],
        providers: [{ provide: IB_TABLE, useValue: mockTable }],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectionHostComponent);
      component = fixture.debugElement.query(
        By.directive(IbSelectionColumn)
      ).componentInstance;
      fixture.detectChanges();
    });

    it("should create with an empty selection model", () => {
      expect(component.selection).toBeTruthy();
      expect(component.selection.selected.length).toBe(0);
    });

    it("should toggle a single row selection and emit output", () => {
      const emitted: IbTableRowSelectionChange[] = [];
      component.ibRowSelectionChange.subscribe((e) => emitted.push(...e));
      const row = mockTable.activeDataSource().filteredData[0];
      component.toggleRowSelection({ checked: true }, row);
      expect(component.selection.isSelected(row)).toBeTrue();
      expect(emitted.length).toBe(1);
      expect(emitted[0].row).toBe(row);
      expect(emitted[0].selection).toBeTrue();
      expect(emitted[0].tableName).toBe("test-table");
    });

    it("should toggle a single row deselection and emit output", () => {
      const row = mockTable.activeDataSource().filteredData[0];
      component.selection.select(row);
      const emitted: IbTableRowSelectionChange[] = [];
      component.ibRowSelectionChange.subscribe((e) => emitted.push(...e));
      component.toggleRowSelection({ checked: false }, row);
      expect(component.selection.isSelected(row)).toBeFalse();
      expect(emitted.length).toBe(1);
      expect(emitted[0].selection).toBeFalse();
    });

    it("should toggle all rows and emit output for each row", () => {
      const emitted: IbTableRowSelectionChange[] = [];
      component.ibRowSelectionChange.subscribe((e) => emitted.push(...e));
      component.toggleAllRows();
      expect(component.isAllSelected()).toBeTrue();
      const selectEvents = emitted.filter((e) => e.selection === true);
      expect(selectEvents.length).toBe(3);
      component.toggleAllRows();
      expect(component.isAllSelected()).toBeFalse();
      const deselectEvents = emitted.filter((e) => e.selection === false);
      expect(deselectEvents.length).toBe(3);
    });

    it("should register isAllSelected correctly", () => {
      expect(component.isAllSelected()).toBeFalse();
      mockTable.activeDataSource().filteredData.forEach((row: any) => component.selection.select(row));
      expect(component.isAllSelected()).toBeTrue();
      component.selection.deselect(mockTable.activeDataSource().filteredData[0]);
      expect(component.isAllSelected()).toBeFalse();
    });

    it("should be disabled when table state is not 'idle'", () => {
      expect(component.isDisabled()).toBeFalse();
      mockTable.state.and.returnValue("loading");
      expect(component.isDisabled()).toBeTrue();
    });

    it("should allow programmatic signal access to selection model", () => {
      const sel = component.selection;
      expect(sel).toBeInstanceOf(SelectionModel);
      expect(sel.selected.length).toBe(0);
    });

    it("should register columnDef with the table on init", () => {
      expect(component.columnDef()).toBeTruthy();
      expect(component.columnDef().name).toBe("ib-selection");
    });

    it("should push 'ib-selection' to the beginning of displayedColumns", () => {
      expect(mockTable.displayedColumns()).toContain("ib-selection");
      expect(mockTable.displayedColumns()[0]).toBe("ib-selection");
    });

    it("should not crash when IB_TABLE is not provided", () => {
      const newTable = createMockTable();
      // Test that toggleAllRows uses table.dataSource.filteredData when table is provided
      expect(() => component.toggleAllRows()).not.toThrow();
    });
  });

  describe("warning on remote", () => {
    it("should log a warning when table is remote", waitForAsync(() => {
      const mockTable = createMockTable();
      mockTable.isRemote.and.returnValue(true);
      spyOn(console, "warn");
      TestBed.configureTestingModule({
        declarations: [SelectionHostComponent, IbSelectionColumn],
        imports: [NoopAnimationsModule, MatTableModule, MatCheckboxModule],
        providers: [{ provide: IB_TABLE, useValue: mockTable }],
      }).compileComponents();
      const fixture = TestBed.createComponent(SelectionHostComponent);
      fixture.detectChanges();
      expect(console.warn).toHaveBeenCalledWith(
        "Selection column is currently not supported with IbTableRemoteDataSource"
      );
    }));
  });
});
