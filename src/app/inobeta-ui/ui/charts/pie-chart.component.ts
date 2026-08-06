import { DecimalPipe } from "@angular/common";
import { Component, computed, inject, input, InputSignal, Signal, ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ChartConfiguration, ChartOptions } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { PieChartData } from "./types";
import 'chart.js/auto';

@Component({
  selector: "pie-chart",
  standalone: true,
  imports: [
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
  ],
  template: `
    <div class="pie-chart-wrapper">
      @if(data().length === 0) {
        <div class="chart-empty">
          <mat-icon class="chart-empty-icon">pie_chart</mat-icon>
          <span class="chart-empty-label">{{ "common.noItems" | translate }}</span>
        </div>
      } @else {
        <canvas
          baseChart
          [data]="chartData()"
          [options]="chartOptions()"
          [type]="'pie'"
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

    .pie-chart-wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
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

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `],
})
export class PieChartComponent {
  title = input<string>("Title");
  data = input<PieChartData[]>([]);
  unit = input<string>();
  options: InputSignal<ChartOptions<"pie"> | null> = input<ChartOptions<"pie"> | null>(null);
  translate = inject(TranslateService);
  decimalPipe = new DecimalPipe(this.translate.currentLang ?? 'it');

  chartData: Signal<ChartConfiguration<"pie">["data"]> = computed(() => {
    const src = this.data() ?? [];

    return {
      labels: src.map((s) => s.name),
      datasets: [
        {
          data: src.map((s) => s.value),
          backgroundColor: src.map((s) => s.backgroundColor),
        },
      ],
    };
  });

  chartOptions: Signal<ChartConfiguration<"pie">["options"]> = computed(
    () =>
      this.options() ?? {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "bottom" },
          tooltip: {
            callbacks: this.unit()
              ? {
                label: (ctx: any) => {
                  const value = ctx.raw;
                  const u = this.unit();
                  return this.decimalPipe.transform(value, '1.0-2') + ' ' + u;
                },
              }
              : undefined,
          },
        },
      }
  );
}

export type PieChartStore = {
  data: PieChartData[];
  unit: string;
}
