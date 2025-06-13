<template>
  <div class="chart-title fontSize-20 text-center fontBold flex-full m5">chart</div>
  <div id="chartContainer" class="chartContainer p10" style="width: 100%; height: 550px"></div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { SciChartSurface, NumericAxis, SplineLineRenderableSeries, XyDataSeries, LegendModifier, EAxisAlignment } from 'scichart';
  import { ChartData } from '@/interfaces/dataquality.interfaces';
  export default defineComponent({
    name: 'ChartContainer',
    data() {
      return {};
    },
    mounted() {
      this.initSciChart();
    },
    methods: {
      computeAutocorrelation(data: ChartData[], maxLag: number) {
        const n = data.length;
        const mean = data.reduce((sum, point) => sum + point.value, 0) / n;
        const autocorrelations = [];

        for (let lag = 0; lag <= maxLag; lag++) {
          let numerator = 0;
          let denominator = 0;

          for (let i = 0; i < n - lag; i++) {
            numerator += (data[i].value - mean) * (data[i + lag].value - mean);
            denominator += (data[i].value - mean) ** 2;
          }

          const lagTime = new Date(data[0].time.getTime() + lag * 3600000); // Each lag = 1 hour
          autocorrelations.push({ time: new Date(lagTime), value: numerator / denominator });
        }

        return autocorrelations;
      },
      async initSciChart() {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create('chartContainer');
        const timeData = [
          { time: new Date('2024-07-01T10:00:00Z'), value: 10 },
          { time: new Date('2024-07-01T11:00:00Z'), value: 20 },
          { time: new Date('2024-07-01T12:00:00Z'), value: 15 },
          { time: new Date('2024-07-01T13:00:00Z'), value: 25 },
          { time: new Date('2024-07-01T14:00:00Z'), value: 30 },
          { time: new Date('2024-07-01T15:00:00Z'), value: 35 },
          { time: new Date('2024-07-01T16:00:00Z'), value: 40 },
          { time: new Date('2024-07-01T17:00:00Z'), value: 45 },
          { time: new Date('2024-07-01T18:00:00Z'), value: 50 },
          { time: new Date('2024-07-01T19:00:00Z'), value: 55 },
          { time: new Date('2024-07-01T20:00:00Z'), value: 60 },
        ];
        const autocorrData = this.computeAutocorrelation(timeData, 11);
        const xValues = autocorrData.map((point) => point.time.getTime());
        const yValues = autocorrData.map((point) => point.value);
        sciChartSurface.xAxes.add(
          new NumericAxis(wasmContext, {
            drawMajorGridLines: false,
            drawMinorGridLines: false,
            axisBandsFill: 'white',
          })
        );
        sciChartSurface.yAxes.add(
          new NumericAxis(wasmContext, {
            axisBandsFill: 'white',
            axisAlignment: EAxisAlignment.Left,
            drawMinorGridLines: false,
            majorGridLineStyle: { color: '#486249', strokeThickness: 1 },
          })
        );

        const autocorrelationSeries = new XyDataSeries(wasmContext, {
          xValues: xValues,
          yValues: yValues,
        });
        const autocorrelationLineSeries = new SplineLineRenderableSeries(wasmContext, {
          dataSeries: autocorrelationSeries,
          stroke: '#ff5722',
          strokeThickness: 2,
        });
        sciChartSurface.renderableSeries.add(autocorrelationLineSeries);

        const legendModifier: LegendModifier = new LegendModifier({
          showLegend: true,
        });
        sciChartSurface.chartModifiers.add(legendModifier);
      },
    },
  });
</script>
<style scoped>
  .chart-title {
    color: var(--graph-title-color);
  }

  .chartContainer {
    background: transparent !important;
  }
</style>
