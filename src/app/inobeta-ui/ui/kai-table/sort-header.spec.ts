import { Component, ViewChild } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { MatSort, MatSortHeader, MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { IbSortHeader } from "./sort-header";

/**
 * The host mirrors the real column template: a mat-table with a column def,
 * a mat-sort-header and the ibSortHeaderFor binding to an external MatSort.
 */
@Component({
  template: `
    <table mat-table [dataSource]="data" matSort>
      <ng-container matColumnDef="testCol">
        <th
          mat-header-cell
          *matHeaderCellDef
          mat-sort-header
          [ibSortHeaderFor]="externalSort"
        >
          Test Header
        </th>
        <td mat-cell *matCellDef="let row">{{ row }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['testCol']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['testCol']"></tr>
    </table>
  `,
  standalone: false,
})
class SortHeaderHostComponent {
  data = ["a", "b"];
  externalSort = new MatSort();
  @ViewChild(MatSort) tableSort!: MatSort;
  @ViewChild(MatSortHeader) matSortHeader!: MatSortHeader;
}

describe("IbSortHeader", () => {
  let fixture: ComponentFixture<SortHeaderHostComponent>;
  let host: SortHeaderHostComponent;
  let directive: IbSortHeader;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SortHeaderHostComponent],
      imports: [NoopAnimationsModule, MatTableModule, MatSortModule, IbSortHeader],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortHeaderHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    directive = fixture.debugElement
      .query(By.directive(IbSortHeader))
      .injector.get(IbSortHeader);
  });

  // --- Requirement 7: ibSortHeaderFor binding ---

  it("should create the directive", () => {
    expect(directive).toBeTruthy();
  });

  it("should read the matSort input signal", () => {
    expect(directive.matSort()).toBe(host.externalSort);
  });

  it("should replace MatSortHeader._sort with the provided MatSort via effect", () => {
    expect(host.matSortHeader._sort).toBe(host.externalSort);
    expect(host.matSortHeader._sort).not.toBe(host.tableSort);
  });

  it("should reflect a change in the external sort reference", () => {
    const newSort = new MatSort();
    host.externalSort = newSort;
    fixture.detectChanges();
    expect(host.matSortHeader._sort).toBe(newSort);
  });

  // --- Requirement 8: programmatic signal access ---

  it("should allow programmatic signal invocation on ibSortHeaderFor binding", () => {
    const sort = directive.matSort();
    expect(sort).toBeInstanceOf(MatSort);
    expect(sort).toBe(host.externalSort);
  });
});
