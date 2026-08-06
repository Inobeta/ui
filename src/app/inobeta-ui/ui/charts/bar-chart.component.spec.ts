import { Component, ChangeDetectionStrategy } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { TooltipItem } from "chart.js";
import { BarChartComponent, ChartSeriesConfig, ChartSeriesData, ChartSeriesMeasure } from "./index";

registerLocaleData(localeIt);

@Component({
  standalone: true,
  imports: [BarChartComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<bar-chart [data]="data" [valueType]="valueType" [measures]="measures" [config]="config" />`,
})
class IbBarChartHostComponent {
  data: ChartSeriesData[] = [];
  valueType: "discrete" | "timeseries" = "discrete";
  measures: ChartSeriesMeasure[] = [];
  config: ChartSeriesConfig | null = null;
}

describe("BarChartComponent", () => {
  let fixture: ComponentFixture<IbBarChartHostComponent>;
  let host: IbBarChartHostComponent;
  let chart: BarChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TranslateModule.forRoot(), IbBarChartHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IbBarChartHostComponent);
    host = fixture.componentInstance;
    fixture.changeDetectorRef.detectChanges();
    chart = fixture.debugElement.children[0].componentInstance as BarChartComponent;
  });

  it("renders empty state when source has no values", () => {
    expect(fixture.nativeElement.querySelector(".chart-empty")).not.toBeNull();
  });

  it("maps discrete values to labels, including zero-filled gaps", () => {
    host.data = [
      { name: "sales", x: "Jan", y: 3 },
      { name: "sales", x: "Feb", y: 4 },
      { name: "costs", x: "Feb", y: 2 },
    ];
    host.measures = [{ name: "sales", color: "green", yAxis: "y1" }];
    fixture.changeDetectorRef.detectChanges();

    expect(chart.chartData()).toEqual(jasmine.objectContaining({
      labels: ["Jan", "Feb"],
      datasets: [
        jasmine.objectContaining({ label: "sales", backgroundColor: "green", yAxisID: "y", data: [3, 4] }),
        jasmine.objectContaining({ label: "costs", backgroundColor: "#46638f", yAxisID: "y1", data: [0, 2] }),
      ],
    }));
  });

  it("filters and sorts timeseries values", () => {
    host.valueType = "timeseries";
    host.data = [
      { name: "sales", x: "2025-02-01", y: 2 },
      { name: "sales", x: "2025-01-01", y: 1 },
      { name: "sales", x: null as unknown as string, y: 4 },
      { name: "sales", x: "2025-03-01", y: null as unknown as number },
    ];
    fixture.changeDetectorRef.detectChanges();

    expect(chart.chartData().datasets[0].data).toEqual([
      { x: new Date("2025-01-01").getTime(), y: 1 },
      { x: new Date("2025-02-01").getTime(), y: 2 },
    ]);
  });

  it("uses configured labels and shows y2 scale only when required", () => {
    host.measures = [{ name: "costs", color: "red", yAxis: "y2" }];
    host.config = { xLabel: "period", y1Label: "sales", y1Symbol: "€", y2Label: "ratio", y2Symbol: "%" };
    fixture.changeDetectorRef.detectChanges();

    const options = chart.chartOptions();
    const scales = options.scales as Record<string, { type?: string; title?: unknown }>;
    expect(scales.x.title).toEqual(jasmine.objectContaining({ display: true, text: "period" }));
    expect(scales.y.title).toEqual(jasmine.objectContaining({ display: true, text: "sales (€)" }));
    expect(scales.y1.title).toEqual(jasmine.objectContaining({ display: true, text: "ratio (%)" }));
  });

  it("uses timeseries and blank labels without optional configuration", () => {
    host.valueType = "timeseries";
    fixture.changeDetectorRef.detectChanges();

    const options = chart.chartOptions();
    const scales = options.scales as Record<string, { type?: string; title?: unknown }>;
    expect(scales.x.type).toBe("timeseries");
    expect(scales.x.title).toEqual(jasmine.objectContaining({ display: false, text: "" }));
    expect(scales.y.title).toEqual(jasmine.objectContaining({ display: false, text: "" }));
    expect(scales.y1).toBeUndefined();
  });

  it("formats tooltip values using secondary and default-axis symbols", () => {
    host.measures = [{ name: "margin", color: "green", yAxis: "y2" }];
    host.config = { xLabel: "", y1Label: "", y1Symbol: "€", y2Label: "", y2Symbol: "%" };
    fixture.changeDetectorRef.detectChanges();
    const callback = chart.chartOptions().plugins!.tooltip!.callbacks!.label!;

    expect(callback.call({} as never, { dataset: { label: "margin" }, parsed: { y: 5.25 }, raw: 0 } as unknown as TooltipItem<"bar">)).toBe("margin: 5,25 %");
    expect(callback.call({} as never, { dataset: { label: "other" }, parsed: { y: null }, raw: 3 } as unknown as TooltipItem<"bar">)).toBe("other: 3 €");
  });

  it("supports primary-axis timeseries and labelled axes without symbols", () => {
    host.valueType = "timeseries";
    host.data = [{ name: "sales", x: "2025-01-01", y: 2 }];
    host.measures = [
      { name: "sales", color: "green", yAxis: "y1" },
      { name: "margin", color: "blue", yAxis: "y2" },
    ];
    host.config = { xLabel: "period", y1Label: "sales", y1Symbol: "", y2Label: "margin", y2Symbol: "" };
    fixture.changeDetectorRef.detectChanges();

    const scales = chart.chartOptions().scales as Record<string, { title?: { text?: string } }>;
    const callback = chart.chartOptions().plugins!.tooltip!.callbacks!.label!;
    expect(chart.chartData().datasets[0]).toEqual(jasmine.objectContaining({ yAxisID: "y" }));
    expect(scales.y.title!.text).toBe("sales");
    expect(scales.y1.title!.text).toBe("margin");
    expect(callback.call({} as never, { dataset: { label: "sales" }, parsed: { y: 2 }, raw: 2 } as unknown as TooltipItem<"bar">)).toBe("sales: 2");
  });
});
