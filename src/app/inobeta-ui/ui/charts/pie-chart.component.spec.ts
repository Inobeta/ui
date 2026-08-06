import { Component } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { ChartOptions } from "chart.js";
import { TooltipItem } from "chart.js";
import { PieChartComponent, PieChartData } from "./index";

registerLocaleData(localeIt);

@Component({
  standalone: true,
  imports: [PieChartComponent],
  template: `<pie-chart [data]="data" [unit]="unit" [options]="options" />`,
})
class IbPieChartHostComponent {
  data: PieChartData[] = [];
  unit: string | undefined;
  options: ChartOptions<"pie"> | null = null;
}

describe("PieChartComponent", () => {
  let fixture: ComponentFixture<IbPieChartHostComponent>;
  let host: IbPieChartHostComponent;
  let chart: PieChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TranslateModule.forRoot(), IbPieChartHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IbPieChartHostComponent);
    host = fixture.componentInstance;
    fixture.changeDetectorRef.detectChanges();
    chart = fixture.debugElement.children[0].componentInstance as PieChartComponent;
  });

  it("renders empty state without data", () => {
    expect(fixture.nativeElement.querySelector(".chart-empty")).not.toBeNull();
    expect(fixture.nativeElement.querySelector("canvas")).toBeNull();
  });

  it("maps supplied slices to chart labels, values, and colours", () => {
    host.data = [
      { name: "Open", value: 4, backgroundColor: "green" },
      { name: "Closed", value: 2, backgroundColor: "red" },
    ];
    fixture.changeDetectorRef.detectChanges();

    expect(chart.chartData()).toEqual({
      labels: ["Open", "Closed"],
      datasets: [{ data: [4, 2], backgroundColor: ["green", "red"] }],
    });
  });

  it("uses supplied chart options unchanged", () => {
    const options: ChartOptions<"pie"> = { responsive: false };
    host.options = options;
    fixture.changeDetectorRef.detectChanges();

    expect(chart.chartOptions()).toBe(options);
  });

  it("creates default options without tooltip callback when unit is absent", () => {
    const options = chart.chartOptions();

    expect(options).toEqual(jasmine.objectContaining({ responsive: true, maintainAspectRatio: false }));
    expect(options.plugins!.tooltip!.callbacks).toBeUndefined();
  });

  it("adds a unit-aware tooltip callback when unit is supplied", () => {
    host.unit = "€";
    fixture.changeDetectorRef.detectChanges();

    const callback = chart.chartOptions().plugins!.tooltip!.callbacks!.label!;
    expect(callback).toEqual(jasmine.any(Function));
    expect(callback.call({} as never, { raw: 12.5 } as unknown as TooltipItem<"pie">)).toBe("12,5 €");
  });
});
