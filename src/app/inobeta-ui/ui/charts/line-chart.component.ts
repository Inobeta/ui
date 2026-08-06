import { DecimalPipe } from "@angular/common";
import { Component, computed, inject, input, Signal, ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ChartConfiguration } from "chart.js";
import "chartjs-adapter-date-fns";
import { BaseChartDirective } from "ng2-charts";
import { ChartSeriesConfig, ChartSeriesData, ChartSeriesMeasure } from "./types";
import 'chart.js/auto';

@Component({
  selector: "line-chart",
  standalone: true,
  imports: [
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
  ],
  providers: [DecimalPipe],
  template: `
    <div class="line-chart-container">
      @if(data().length === 0) {
        <div class="chart-empty">
          <mat-icon class="chart-empty-icon">stacked_line_chart</mat-icon>
          <span class="chart-empty-label">{{ "common.noItems" | translate }}</span>
        </div>
      } @else {
      <canvas
        baseChart
        [data]="chartData()"
        [options]="chartOptions()"
        [type]="'line'"
      ></canvas>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .line-chart-container {
      display: flex;
      width: 100%;
      height: 100%;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
    }

    .chart-empty {
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      min-height: 150px;
      border: 1px solid lightgray;
      border-radius: 10px;
    }

    .chart-empty-icon {
      font-size: 2.25rem;
      width: 2.25rem;
      height: 2.25rem;
    }

    .chart-empty-label {
      font-size: 0.875rem;
      color: #6b7280;
    }
  `],
})
export class LineChartComponent {
  translate = inject(TranslateService);
  decimalPipe = new DecimalPipe(this.translate.currentLang ?? 'it');

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
            borderColor: cfg?.color ?? "#46638f",
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
          borderColor: cfg?.color ?? "#46638f",
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
      maintainAspectRatio: false,
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
        legend: {
          display: true,
          position: "right",
          labels: {
            boxWidth: 60,
            usePointStyle: true,
            maxWidth: 80,
            font: { size: 12 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const datasetLabel = context.dataset.label as string;
              const cfg = measures.find((c) => c.name === datasetLabel);
              const value = context.parsed.y ?? (context.raw as number);

              const symbol =
                cfg?.yAxis === "y2"
                  ? config?.y2Symbol
                  : config?.y1Symbol;

              const formattedValue = this.decimalPipe.transform(value, "1.0-2") ?? `${value}`;

              return `${datasetLabel}: ${formattedValue}${symbol ? " " + symbol : ""}`;
            },
          },
        },
      },
    };
  });
}
