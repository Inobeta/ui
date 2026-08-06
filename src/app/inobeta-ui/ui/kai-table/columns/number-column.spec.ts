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
import { IbNumberColumn } from "./number-column";
import { IbColumn } from "./column";

registerLocaleData(localeIt);

@Component({
  template: `
    <ib-number-column
      [name]="'amount'"
      [headerText]="'Amount'"
      [digitsInfo]="digitsValue"
      [locale]="localeValue"
      [um]="umValue"
      [umPosition]="umPosValue"
    ></ib-number-column>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class NumberColumnHostComponent {
  digitsValue = "1.2-2";
  localeValue = "it";
  umValue = "€";
  umPosValue: "right" | "left" = "right";
}

describe("IbNumberColumn", () => {
  let fixture: ComponentFixture<NumberColumnHostComponent>;
  let host: NumberColumnHostComponent;
  let component: IbNumberColumn<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NumberColumnHostComponent, IbNumberColumn],
      imports: [NoopAnimationsModule, MatTableModule, MatSortModule, IbColumn],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(NumberColumnHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    component = fixture.debugElement.query(
      By.directive(IbNumberColumn)
    ).componentInstance;
  });

  it("should read digitsInfo as a signal", () => {
    expect(component.digitsInfo()).toBe("1.2-2");
  });

  it("should update digitsInfo signal", async () => {
    host.digitsValue = "1.3-3";
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.digitsInfo()).toBe("1.3-3");
  });

  it("should read locale as a signal", () => {
    expect(component.locale()).toBe("it");
  });

  it("should update locale signal", async () => {
    host.localeValue = "en-US";
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.locale()).toBe("en-US");
  });

  it("should read um as a signal", async () => {
    expect(component.um()).toBe("€");
    host.umValue = "$";
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.um()).toBe("$");
  });

  it("should read umPosition as a signal with default 'right'", () => {
    expect(component.umPosition()).toBe("right");
  });

  it("should update umPosition signal", async () => {
    host.umPosValue = "left";
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.umPosition()).toBe("left");
  });

  it("should format number in mobileDataRenderer with unit", () => {
    const result = component.mobileDataRenderer({ amount: 1234.56 }, "amount");
    expect(result).toContain("1.234,56");
    expect(result).toContain("€");
  });

  it("should prepend unit when umPosition is left", async () => {
    host.umPosValue = "left";
    fixture.detectChanges();
    await fixture.whenStable();
    const result = component.mobileDataRenderer({ amount: 100 }, "amount");
    expect(result.startsWith("€")).toBeTrue();
  });

  it("should return formatted value without unit when um is empty", async () => {
    host.umValue = "";
    fixture.detectChanges();
    await fixture.whenStable();
    const result = component.mobileDataRenderer({ amount: 42 }, "amount");
    expect(result).not.toContain("€");
  });

  it("should extend IbColumn and inherit name signal", () => {
    expect(component.name()).toBe("amount");
  });

  it("should have header text as a model signal", () => {
    expect(component.headerText()).toBe("Amount");
  });

  it("should allow programmatic signal invocation on digitsInfo", () => {
    const digits = component.digitsInfo();
    expect(digits).toBe("1.2-2");
    expect(typeof digits).toBe("string");
  });

  it("should allow programmatic signal invocation on um", () => {
    const unit = component.um();
    expect(unit).toBe("€");
  });
});
