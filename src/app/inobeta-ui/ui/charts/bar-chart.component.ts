import { Component, computed, inject, input, Signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ChartConfiguration } from "chart.js";
import "chartjs-adapter-date-fns";
import { BaseChartDirective } from "ng2-charts";
import { DecimalPipe } from "@angular/common";
import { ChartSeriesConfig, ChartSeriesData, ChartSeriesMeasure } from "./types";

@Component({
  selector: "bar-chart",
  standalone: true,
  imports: [
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
  ],
  template: `
    <div class="bar-chart-container">
      <canvas
        baseChart
        [data]="chartData()"
        [options]="chartOptions()"
        [type]="'bar'"
      ></canvas>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .bar-chart-container {
      display: flex;
      width: 100%;
      height: 100%;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class BarChartComponent {
  translate = inject(TranslateService);
  decimal = inject(DecimalPipe);

  title = input<string>("Title");
  data = input<ChartSeriesData[]>([]);
  valueType = input<"discrete" | "timeseries">("discrete");
  measures = input<ChartSeriesMeasure[]>([]);
  config = input<ChartSeriesConfig | null>(null);

  private configMap = computed(() => {
    const map = new Map<string, ChartSeriesMeasure>();
    this.measures().forEach((c) => map.set(c.name, c));
    return map;
  });

  private labels = computed(() => {
    if (this.valueType() !== "discrete") return [];
    return [...new Set(this.data().map((d) => d.x))];
  });

  chartData: Signal<ChartConfiguration["data"]> = computed(() => {
    const raw = this.data();
    const configMap = this.configMap();

    const grouped = new Map<string, ChartSeriesData[]>();

    raw.forEach((d) => {
      if (!grouped.has(d.name)) grouped.set(d.name, []);
      grouped.get(d.name)!.push(d);
    });

    if (this.valueType() === "discrete") {
      const labels = this.labels();

      return {
        labels,
        datasets: Array.from(grouped.entries()).map(([name, values]) => {
          const cfg = configMap.get(name);

          return {
            label: name,
            backgroundColor: cfg?.color ?? "#46638f",
            yAxisID: cfg?.yAxis === "y1" ? "y" : "y1",
            data: labels.map(
              (label) => values.find((v) => v.x === label)?.y ?? 0
            ),
          };
        }),
      };
    }

    return {
      datasets: Array.from(grouped.entries()).map(([name, values]) => {
        const cfg = configMap.get(name);

        return {
          label: name,
          backgroundColor: cfg?.color ?? "#46638f",
          yAxisID: cfg?.yAxis === "y1" ? "y" : "y1",
          data: values
            .filter((v) => v.x != null && v.y != null)
            .map((v) => ({ x: new Date(v.x).getTime(), y: v.y }))
            .sort((a, b) => a.x - b.x),
        };
      }),
    };
  });

  chartOptions: Signal<ChartConfiguration["options"]> = computed(() => {
    const measures = this.measures();
    const config = this.config();

    const hasY2 = measures.some((c) => c.yAxis === "y2");

    return {
      responsive: true,

      scales: {
        x: {
          type: this.valueType() === "discrete" ? "category" : "timeseries",
          position: "bottom",
          title: {
            display: !!config?.xLabel,
            text: config?.xLabel
              ? this.translate.instant(config.xLabel)
              : "",
          },
        },

        y: {
          position: "left",
          display: true,
          title: {
            display: !!config?.y1Label,
            text: config?.y1Label
              ? `${this.translate.instant(config.y1Label)}${config?.y1Symbol ? ` (${config.y1Symbol})` : ""
              }`
              : "",
          },
        },

        ...(hasY2 && {
          y1: {
            position: "right",
            display: true,
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: !!config?.y2Label,
              text: config?.y2Label
                ? `${this.translate.instant(config.y2Label)}${config?.y2Symbol ? ` (${config.y2Symbol})` : ""
                }`
                : "",
            },
          },
        }),
      },

      plugins: {
        legend: { display: true, position: "right" },

        tooltip: {
          callbacks: {
            label: (context) => {
              const datasetLabel = context.dataset.label as string;
              const cfg = measures.find((c) => c.name === datasetLabel);
              const value: number = context.parsed.y ?? (context.raw as number);

              const symbol =
                cfg?.yAxis === "y2"
                  ? config?.y2Symbol
                  : config?.y1Symbol;

              // 👇 formatting con DecimalPipe
              const formatted = this.decimal.transform(value, '1.0-2', 'it-IT');

              return `${datasetLabel}: ${formatted}${symbol ? " " + symbol : ""}`;
            },
          },
        },
      },
    };
  });
}
