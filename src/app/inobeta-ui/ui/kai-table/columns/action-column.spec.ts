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
import { IbActionColumn } from "./action-column";
import { IbColumn } from "./column";
import { IbSortHeader } from "../sort-header";
import { IB_TABLE } from "../tokens";

@Component({
  template: `<ib-column ib-action-column name="foo" headerText="Bar"></ib-column>`,
  standalone: false,
})
class ActionColumnHostComponent {}

describe("IbActionColumn", () => {
  let fixture: ComponentFixture<ActionColumnHostComponent>;
  let actionCol: IbActionColumn;
  let column: IbColumn<unknown>;
  let mockTable: any;

  beforeEach(waitForAsync(() => {
    mockTable = {
      matTable: { addColumnDef: () => {}, removeColumnDef: () => {} },
      dataSource: {},
      displayedColumns: [] as string[],
      sort: null,
    };

    TestBed.configureTestingModule({
      declarations: [ActionColumnHostComponent, IbActionColumn],
      imports: [NoopAnimationsModule, MatTableModule, MatSortModule, IbColumn, IbSortHeader],
      providers: [{ provide: IB_TABLE, useValue: mockTable }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionColumnHostComponent);
    const actionDebugEl = fixture.debugElement.query(By.directive(IbActionColumn));
    actionCol = actionDebugEl.injector.get(IbActionColumn);
    column = fixture.debugElement.query(By.directive(IbColumn)).componentInstance;
    fixture.detectChanges();
  });

  it("should set the column name to 'ib-action'", () => {
    expect(column.name()).toBe("ib-action");
  });

  it("should clear the header text", () => {
    expect(column.headerText()).toBe("");
  });

  it("should not mutate the table displayedColumns", () => {
    expect(mockTable.displayedColumns).toEqual([]);
  });

  it("should reference the ibColumn", () => {
    expect(actionCol.ibColumn).toBe(column);
  });
});
