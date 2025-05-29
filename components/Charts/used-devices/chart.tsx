"use client";

import { compactFormat } from "@/lib/format-number";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: { name: string; amount: number; percentage?: number }[];
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function DonutChart({ data }: PropsType) {
  console.log('🍩 DonutChart received data:', data);
  
  // Filter out zero amounts for cleaner chart
  const filteredData = data.filter(item => item.amount > 0);
  console.log('🍩 Filtered data (non-zero):', filteredData);
  
  // If no data, show placeholder
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div>No device data available</div>
        </div>
      </div>
    );
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    // Using your design system chart colors
    colors: [
      "hsl(var(--chart-1))", // Primary blue  
      "hsl(var(--chart-2))", // Secondary
      "hsl(var(--chart-3))", // Tertiary
      "hsl(var(--chart-4))", // Quaternary
      "hsl(var(--chart-5))"  // Fallback
    ],
    labels: filteredData.map((item) => item.name),
    legend: {
      show: true,
      position: "bottom",
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      formatter: (legendName, opts) => {
        const value = filteredData[opts.seriesIndex];
        const percentage = Math.round((value.amount / filteredData.reduce((sum, d) => sum + d.amount, 0)) * 100);
        return `${legendName}: ${percentage}%`;
      },
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
              label: "Total Sessions",
              fontSize: "16px",
              fontWeight: "400",
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
              formatter: (val) => compactFormat(+val),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value, { seriesIndex }) => {
          const total = filteredData.reduce((sum, d) => sum + d.amount, 0);
          const percentage = Math.round((value / total) * 100);
          return `${compactFormat(value)} sessions (${percentage}%)`;
        }
      }
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

  const series = filteredData.map((item) => item.amount);
  console.log('🍩 Chart series data:', series);

  return (
    <Chart
      options={chartOptions}
      series={series}
      type="donut"
    />
  );
}