import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { TranslateModule } from "@ngx-translate/core";
import {
  IbAggregate,
  IbAggregateCell,
  IbCellDef,
} from "./cells";
import { IB_AGGREGATE, IB_AGGREGATE_TYPE, IB_COLUMN } from "./tokens";

// ===========================================================================
// Host for IbCellDef
// ===========================================================================

@Component({
  template: `
    <ng-template *ibCellDef="let data">{{ data?.value }}</ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class CellDefHostComponent {
  @ViewChild(IbCellDef, { static: true }) cellDef!: IbCellDef;
}

// ===========================================================================
// Stub aggregate functions
// ===========================================================================

class StubSumAggregate extends IbAggregate {
  id = "sum";
  name = "stub.sum.name";
  label = "stub.sum.label";
  type = "number";
  aggregateData(data: number[]) { return data.reduce((a, b) => a + b, 0); }
}

class StubCountAggregate extends IbAggregate {
  id = "cnt";
  name = "stub.cnt.name";
  label = "stub.cnt.label";
  type = "string";
  aggregateData(data: any[]) { return data.length; }
}

// ===========================================================================
// Host for IbAggregateCell
// ===========================================================================

@Component({
  template: `
    <ib-aggregate
      [showTotal]="showTotal"
      [result]="{ currentPage: 42, total: 100 }"
      [function]="'sum'"
      (ibFunctionChange)="onFunctionChange($event)"
    ></ib-aggregate>
  `,
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    { provide: IB_COLUMN, useValue: { name: () => "amount" } },
    { provide: IB_AGGREGATE_TYPE, useValue: "number" },
    { provide: IB_AGGREGATE, useClass: StubSumAggregate, multi: true },
    { provide: IB_AGGREGATE, useClass: StubCountAggregate, multi: true },
  ],
})
class AggregateHostComponent {
  showTotal = true;
  onFunctionChange = jasmine.createSpy("onFunctionChange");
}

describe("IbCellDef", () => {
  let fixture: ComponentFixture<CellDefHostComponent>;
  let host: CellDefHostComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CellDefHostComponent, IbCellDef],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(CellDefHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should expose a templateRef", () => {
    expect(host.cellDef).toBeTruthy();
    expect(host.cellDef.templateRef).toBeInstanceOf(TemplateRef);
  });
});

describe("IbAggregateCell", () => {
  let fixture: ComponentFixture<AggregateHostComponent>;
  let host: AggregateHostComponent;
  let component: IbAggregateCell;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AggregateHostComponent, IbAggregateCell],
      imports: [
        NoopAnimationsModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        TranslateModule.forRoot({ extend: true }),
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(AggregateHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    component = fixture.debugElement.query(By.directive(IbAggregateCell)).componentInstance;
  });

  it("should read the function input signal", () => {
    expect(component.function()).toBe("sum");
  });

  it("should read the result input signal", () => {
    const result = component.result();
    expect(result.currentPage).toBe(42);
    expect(result.total).toBe(100);
  });

  it("should read showTotal input signal", async () => {
    expect(component.showTotal()).toBeTrue();
    host.showTotal = false;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.showTotal()).toBeFalse();
  });

  it("should emit ibFunctionChange when apply is called", () => {
    component.apply("sum");
    expect(host.onFunctionChange).toHaveBeenCalledWith("sum");
  });

  it("should filter available functions by type", () => {
    expect(component.availableFunctions.length).toBe(1);
    expect(component.availableFunctions[0].id).toBe("sum");
  });

  it("should update display name when function is applied", () => {
    component.apply("sum");
    expect(component.displayName).toBe("stub.sum.name");
  });

  it("should clear display name for unknown function", () => {
    component.updateDisplayName("unknown");
    expect(component.displayName).toBe("");
  });

  it("should allow programmatic signal invocation on function", () => {
    const fun = component.function();
    expect(fun).toBe("sum");
  });

  it("should allow programmatic signal invocation on result", () => {
    const res = component.result();
    expect(res.currentPage).toBe(42);
  });
});
