import { Component, computed, input, InputSignal, Signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { PieChartData } from "./types";
import { TranslateModule } from "@ngx-translate/core";
import { ChartConfiguration, ChartOptions } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { CurrencyPipe, DecimalPipe } from "@angular/common";

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
    <div class="flex size-full justify-center items-center">
      <canvas
        baseChart
        [data]="chartData()"
        [options]="chartOptions()"
        [type]="'pie'"
      ></canvas>
    </div>
  `,
})
export class PieChartComponent {
  title = input<string>("Title");
  data = input<PieChartData[]>([]);
  unit = input<string>();
  options: InputSignal<ChartOptions<"pie"> | null> = input<ChartOptions<"pie"> | null>(null);
  decimalPipe = new DecimalPipe('it-IT');

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


