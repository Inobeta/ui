

export type ChartSeriesData = {
  name: string;
  x: string;
  y: number;
};
export type ChartSeriesMeasure = {
  name: string;
  color: string;
  yAxis: "y1" | "y2";
}
export type ChartSeriesConfig = {
  xLabel: string;
  y1Label: string;
  y1Symbol: string;
  y2Label?: string;
  y2Symbol?: string;
}


export type PieChartData = {
  name: string,
  backgroundColor: string,
  value: number
}


export type RingGaugeAdditionalInfo = {
  label: string;
  icon: string;
  labelColor: string;
  iconColor: string;
}

export type SingleValueAdditionalInfo = {
  label: string;
  icon: string;
  labelColor: string;
  iconColor: string
}
