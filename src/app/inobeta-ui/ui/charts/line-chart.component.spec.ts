import { Component, ChangeDetectionStrategy } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { TooltipItem } from "chart.js";
import { ChartSeriesConfig, ChartSeriesData, ChartSeriesMeasure, LineChartComponent } from "./index";

registerLocaleData(localeIt);

@Component({
  standalone: true,
  imports: [LineChartComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<line-chart [data]="data" [valueType]="valueType" [measures]="measures" [config]="config" />`,
})
class IbLineChartHostComponent {
  data: ChartSeriesData[] = [];
  valueType: "discrete" | "timeseries" = "discrete";
  measures: ChartSeriesMeasure[] = [];
  config: ChartSeriesConfig | null = null;
}

describe("LineChartComponent", () => {
  let fixture: ComponentFixture<IbLineChartHostComponent>;
  let host: IbLineChartHostComponent;
  let chart: LineChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TranslateModule.forRoot(), IbLineChartHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IbLineChartHostComponent);
    host = fixture.componentInstance;
    fixture.changeDetectorRef.detectChanges();
    chart = fixture.debugElement.children[0].componentInstance as LineChartComponent;
  });

  it("renders empty state when no points are supplied", () => {
    expect(fixture.nativeElement.querySelector(".chart-empty")).not.toBeNull();
    expect(fixture.nativeElement.querySelector("canvas")).toBeNull();
  });

  it("groups discrete values, fills missing labels, and applies measure axes", () => {
    host.data = [
      { name: "orders", x: "Jan", y: 2 },
      { name: "orders", x: "Feb", y: 4 },
      { name: "returns", x: "Feb", y: 1 },
    ];
    host.measures = [
      { name: "orders", color: "red", yAxis: "y1" },
      { name: "returns", color: "blue", yAxis: "y2" },
    ];
    fixture.changeDetectorRef.detectChanges();

    const data = chart.chartData();
    expect(data.labels).toEqual(["Jan", "Feb"]);
    expect(data.datasets).toEqual([
      jasmine.objectContaining({ label: "orders", backgroundColor: "red", borderColor: "red", yAxisID: "y", data: [2, 4] }),
      jasmine.objectContaining({ label: "returns", backgroundColor: "blue", borderColor: "blue", yAxisID: "y1", data: [0, 1] }),
    ]);
  });

  it("uses defaults for unconfigured series", () => {
    host.data = [{ name: "orders", x: "Jan", y: 2 }];
    fixture.changeDetectorRef.detectChanges();

    expect(chart.chartData().datasets).toEqual([
      jasmine.objectContaining({ backgroundColor: "#46638f", borderColor: "#46638f", yAxisID: "y1" }),
    ]);
  });

  it("filters and orders valid timeseries points", () => {
    host.valueType = "timeseries";
    host.data = [
      { name: "orders", x: "2025-02-01", y: 2 },
      { name: "orders", x: "2025-01-01", y: 1 },
      { name: "orders", x: null as unknown as string, y: 3 },
      { name: "orders", x: "2025-03-01", y: null as unknown as number },
    ];
    fixture.changeDetectorRef.detectChanges();

    expect(chart.chartData().datasets[0].data).toEqual([
      { x: new Date("2025-01-01").getTime(), y: 1 },
      { x: new Date("2025-02-01").getTime(), y: 2 },
    ]);
  });

  it("creates labelled dual-axis options when configuration supplies both axes", () => {
    host.measures = [{ name: "returns", color: "blue", yAxis: "y2" }];
    host.config = { xLabel: "period", y1Label: "orders", y1Symbol: "€", y2Label: "rate", y2Symbol: "%" };
    fixture.changeDetectorRef.detectChanges();

    const options = chart.chartOptions();
    const scales = options.scales as Record<string, { type?: string; title?: unknown }>;
    expect(scales.x.type).toBe("category");
    expect(scales.y.title).toEqual(jasmine.objectContaining({ display: true, text: "orders (€)" }));
    expect(scales.y1.title).toEqual(jasmine.objectContaining({ display: true, text: "rate (%)" }));
  });

  it("uses empty axis labels and omits second axis without matching measure", () => {
    host.valueType = "timeseries";
    fixture.changeDetectorRef.detectChanges();

    const options = chart.chartOptions();
    const scales = options.scales as Record<string, { type?: string; title?: unknown }>;
    expect(scales.x.type).toBe("timeseries");
    expect(scales.x.title).toEqual(jasmine.objectContaining({ display: false, text: "" }));
    expect(scales.y1).toBeUndefined();
  });

  it("formats tooltip values with their configured axis symbols", () => {
    host.measures = [{ name: "rate", color: "blue", yAxis: "y2" }];
    host.config = { xLabel: "", y1Label: "", y1Symbol: "€", y2Label: "", y2Symbol: "%" };
    fixture.changeDetectorRef.detectChanges();
    const callback = chart.chartOptions().plugins!.tooltip!.callbacks!.label!;

    expect(callback.call({} as never, { dataset: { label: "rate" }, parsed: { y: 12.5 }, raw: 0 } as unknown as TooltipItem<"line">)).toBe("rate: 12,5 %");
    expect(callback.call({} as never, { dataset: { label: "other" }, parsed: { y: null }, raw: 4 } as unknown as TooltipItem<"line">)).toBe("other: 4 €");
  });

  it("supports primary-axis timeseries and labelled axes without symbols", () => {
    host.valueType = "timeseries";
    host.data = [{ name: "orders", x: "2025-01-01", y: 2 }];
    host.measures = [
      { name: "orders", color: "red", yAxis: "y1" },
      { name: "returns", color: "blue", yAxis: "y2" },
    ];
    host.config = { xLabel: "period", y1Label: "orders", y1Symbol: "", y2Label: "returns", y2Symbol: "" };
    fixture.changeDetectorRef.detectChanges();

    const scales = chart.chartOptions().scales as Record<string, { title?: { text?: string } }>;
    const callback = chart.chartOptions().plugins!.tooltip!.callbacks!.label!;
    expect(chart.chartData().datasets[0]).toEqual(jasmine.objectContaining({ yAxisID: "y" }));
    expect(scales.y.title!.text).toBe("orders");
    expect(scales.y1.title!.text).toBe("returns");
    expect(callback.call({} as never, { dataset: { label: "orders" }, parsed: { y: 2 }, raw: 2 } as unknown as TooltipItem<"line">)).toBe("orders: 2");
  });
});
