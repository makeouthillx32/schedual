"use client";

import { compactFormat } from "@/lib/format-number";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: { name: string; amount: number }[];
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Helper function to get CSS variable value
const getCssVariableColor = (variableName: string): string => {
  if (typeof window !== 'undefined') {
    // Get the CSS variable value with fallback
    const style = getComputedStyle(document.documentElement);
    return `hsl(${style.getPropertyValue(variableName)})`;
  }
  return '#000000'; // Fallback for SSR
};

export function DonutChart({ data }: PropsType) {
  // We'll use useEffect to set the colors after component mount
  // since we need access to the DOM to get CSS variable values
  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "var(--font-sans)",
    },
    // We'll use your chart colors from CSS variables
    colors: [
      "hsl(var(--chart-1))", 
      "hsl(var(--chart-2))", 
      "hsl(var(--chart-3))", 
      "hsl(var(--chart-4))", 
      "hsl(var(--chart-5))"
    ].slice(0, data.length), // Limit colors to data length
    labels: data.map((item) => item.name),
    legend: {
      show: true,
      position: "bottom",
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      formatter: (legendName, opts) => {
        const { seriesPercent } = opts.w.globals;
        return `${legendName}: ${seriesPercent[opts.seriesIndex]}%`;
      },
      labels: {
        colors: "hsl(var(--foreground))"
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Visitors",
              fontSize: "16px",
              fontWeight: "400",
              color: "hsl(var(--muted-foreground))"
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
              color: "hsl(var(--foreground))",
              formatter: (val) => compactFormat(+val),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      colors: ["hsl(var(--card))"]
    },
    theme: {
      mode: 'light' // This will be updated dynamically based on current theme
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 415,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: "100%",
          },
        },
      },
      {
        breakpoint: 370,
        options: {
          chart: {
            width: 260,
          },
        },
      },
    ],
  };

  // Update chart colors dynamically on client side
  if (typeof window !== 'undefined') {
    // Detect dark mode
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
      document.documentElement.classList.contains('dark');
    
    // Update chart theme based on current mode
    chartOptions.theme = {
      mode: isDarkMode ? 'dark' : 'light',
    };
    
    // Update text colors for dark mode
    if (isDarkMode) {
      if (chartOptions.legend?.labels) {
        chartOptions.legend.labels.colors = "hsl(var(--foreground))";
      }
      
      if (chartOptions.plotOptions?.pie?.donut?.labels) {
        const labels = chartOptions.plotOptions.pie.donut.labels;
        if (labels.total) {
          labels.total.color = "hsl(var(--foreground))";
        }
        if (labels.value) {
          labels.value.color = "hsl(var(--foreground))";
        }
      }
    }
  }

  return (
    <Chart
      options={chartOptions}
      series={data.map((item) => item.amount)}
      type="donut"
    />
  );
}