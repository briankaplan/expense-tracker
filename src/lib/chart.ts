import { ChartOptions } from 'chart.js';

export const defaultOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        boxWidth: 6,
      }
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      backgroundColor: 'hsl(var(--background))',
      titleColor: 'hsl(var(--foreground))',
      bodyColor: 'hsl(var(--muted-foreground))',
      borderColor: 'hsl(var(--border))',
      borderWidth: 1,
      padding: 12,
      boxPadding: 4,
      usePointStyle: true,
      boxWidth: 6,
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
        font: {
          size: 11,
        },
      }
    },
    y: {
      grid: {
        color: 'hsl(var(--border))',
      },
      border: {
        display: false,
      },
      ticks: {
        color: 'hsl(var(--muted-foreground))',
        font: {
          size: 11,
        },
      }
    }
  }
}; 