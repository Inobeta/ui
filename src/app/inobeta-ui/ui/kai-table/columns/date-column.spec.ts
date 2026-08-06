import { Component, ChangeDetectionStrategy } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { IbDateColumn } from "./date-column";
import { IbColumn } from "./column";

registerLocaleData(localeIt);

@Component({
  template: `
    <ib-date-column
      [name]="'createdAt'"
      [headerText]="'Created'"
      [format]="formatValue"
      [locale]="localeValue"
      [dataAccessor]="accessorFn"
    ></ib-date-column>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class DateColumnHostComponent {
  formatValue = "dd/MM/yyyy HH:mm z";
  localeValue = "it";
  accessorFn = (data: any) => data.createdAt;
}

describe("IbDateColumn", () => {
  let fixture: ComponentFixture<DateColumnHostComponent>;
  let host: DateColumnHostComponent;
  let component: IbDateColumn<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DateColumnHostComponent, IbDateColumn],
      imports: [NoopAnimationsModule, MatTableModule, MatSortModule, IbColumn],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(DateColumnHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    component = fixture.debugElement.query(
      By.directive(IbDateColumn)
    ).componentInstance;
  });

  it("should read format as a signal with default value", () => {
    expect(component.format()).toBe("dd/MM/yyyy HH:mm z");
  });

  it("should update format signal", async () => {
    host.formatValue = "yyyy-MM-dd";
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(component.format()).toBe("yyyy-MM-dd");
  });

  it("should read locale as a signal with default 'it'", () => {
    expect(component.locale()).toBe("it");
  });

  it("should update locale signal", async () => {
    host.localeValue = "en-US";
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(component.locale()).toBe("en-US");
  });

  it("should override filterDataAccessor to return timestamp", () => {
    const testDate = new Date("2023-01-15T10:30:00Z");
    const timestamp = component.filterDataAccessor()({ createdAt: testDate }, "createdAt");
    expect(timestamp).toBe(testDate.getTime());
  });

  it("should format date in mobileDataRenderer", () => {
    const testDate = new Date(2023, 0, 15, 10, 30, 0);
    const result = component.mobileDataRenderer({ createdAt: testDate }, "createdAt");
    expect(result).toContain("15/01/2023");
    expect(result).toContain("10:30");
  });

  it("should expose a pdf transform function", () => {
    expect(component.transform).toBeTruthy();
    expect(typeof component.transform.pdf).toBe("function");
  });

  it("should transform date for pdf export", () => {
    const testDate = new Date(2023, 0, 15, 10, 30, 0);
    const result = component.transform.pdf(testDate);
    expect(result).toContain("15/01/2023");
  });

  it("should extend IbColumn and inherit name signal", () => {
    expect(component.name()).toBe("createdAt");
  });

  it("should have header text as a model signal", () => {
    expect(component.headerText()).toBe("Created");
  });

  it("should allow programmatic signal invocation on format", () => {
    const fmtVal = component.format();
    expect(fmtVal).toBe("dd/MM/yyyy HH:mm z");
    expect(typeof fmtVal).toBe("string");
  });
});
