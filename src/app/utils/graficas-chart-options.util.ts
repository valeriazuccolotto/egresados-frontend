import { TooltipItem } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export { ChartDataLabels };

const COLOR_TEXTO = '#204f4b';
const COLOR_EJE = '#204f4b';

function etiquetaTooltipCircular(total: number) {
  return (ctx: TooltipItem<'pie' | 'doughnut'>) => {
    const value = Number(ctx.raw) || 0;
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    return `${ctx.label}: ${value} egresado(s) (${pct}%)`;
  };
}

function etiquetaTooltipBarra() {
  return (ctx: TooltipItem<'bar'>) => {
    const valor = Number(ctx.raw) || 0;
    return `${ctx.label}: ${valor} egresado(s)`;
  };
}

export function opcionesGraficaCircular(total: number): Record<string, unknown> {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 13 }, color: COLOR_TEXTO }
      },
      tooltip: {
        enabled: true,
        callbacks: { label: etiquetaTooltipCircular(total) }
      },
      datalabels: {
        color: '#fff',
        font: { size: 13, weight: 'bold' as const },
        formatter: (value: number) => {
          if (total === 0 || value === 0) {
            return '';
          }
          return `${value}\n(${((value / total) * 100).toFixed(1)}%)`;
        }
      }
    }
  };
}

export function opcionesGraficaBarraVertical(maxTicks?: number): Record<string, unknown> {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: { label: etiquetaTooltipBarra() }
      },
      datalabels: {
        anchor: 'end' as const,
        align: 'end' as const,
        offset: 2,
        color: COLOR_TEXTO,
        font: { size: 12, weight: 'bold' as const },
        formatter: (value: number) => (value === 0 ? '' : String(value))
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: COLOR_EJE }
      },
      x: {
        ticks: {
          color: COLOR_EJE,
          maxRotation: maxTicks ?? 45,
          minRotation: maxTicks ? 45 : 0
        }
      }
    }
  };
}

export function opcionesGraficaBarraHorizontal(): Record<string, unknown> {
  return {
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: { label: etiquetaTooltipBarra() }
      },
      datalabels: {
        anchor: 'end' as const,
        align: 'end' as const,
        offset: 4,
        color: COLOR_TEXTO,
        font: { size: 12, weight: 'bold' as const },
        formatter: (value: number) => (value === 0 ? '' : String(value))
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: COLOR_EJE }
      },
      y: {
        ticks: { color: COLOR_EJE }
      }
    }
  };
}
