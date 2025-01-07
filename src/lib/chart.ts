import { ChartOptions } from 'chart.js';

export const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 2,
      hitRadius: 4,
      hoverRadius: 4,
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  animation: {
    duration: 750,
  },
}; 