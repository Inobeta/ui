import { Component, ChangeDetectionStrategy } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { IbTextColumn } from "./text-column";
import { IbColumn } from "./column";

@Component({
  template: `
    <ib-text-column
      [name]="'textTest'"
      [headerText]="'Text'"
      [justify]="justifyValue"
    ></ib-text-column>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class TextColumnHostComponent {
  justifyValue: "start" | "end" | "center" = "start";
}

describe("IbTextColumn", () => {
  let fixture: ComponentFixture<TextColumnHostComponent>;
  let host: TextColumnHostComponent;
  let component: IbTextColumn<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TextColumnHostComponent, IbTextColumn],
      imports: [NoopAnimationsModule, MatTableModule, MatSortModule, IbColumn],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TextColumnHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    component = fixture.debugElement.query(
      By.directive(IbTextColumn)
    ).componentInstance;
  });

  it("should read justify as a signal with default 'start'", () => {
    expect(component.justify()).toBe("start");
  });

  it("should update justify signal when host changes value", async () => {
    host.justifyValue = "end";
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(component.justify()).toBe("end");
    host.justifyValue = "center";
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(component.justify()).toBe("center");
  });

  it("should have header text as a model signal", () => {
    expect(component.headerText()).toBe("Text");
  });

  it("should extend IbColumn and inherit name signal", () => {
    expect(component.name()).toBe("textTest");
  });

  it("should allow programmatic signal invocation on justify", () => {
    const justifyVal = component.justify();
    expect(justifyVal).toBe("start");
    expect(typeof justifyVal).toBe("string");
  });
});
