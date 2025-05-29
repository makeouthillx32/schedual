"use client";

import { compactFormat } from "@/lib/format-number";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type ChartData = {
  name: string;
  amount: number;
  percentage?: number;
}[];

type PropsType = {
  data: ChartData;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function DonutChart({ data }: PropsType) {
  console.log('🍩 [DonutChart] Received data:', data);
  
  // Validate and filter data
  if (!data || !Array.isArray(data)) {
    console.warn('🍩 [DonutChart] Invalid data format:', data);
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <div>Invalid chart data format</div>
        </div>
      </div>
    );
  }

  // Filter out zero amounts
  const filteredData = data.filter(item => item && item.amount > 0);
  console.log('🍩 [DonutChart] Filtered data:', filteredData);
  
  // Show placeholder if no data
  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div>No device data available</div>
          <div className="text-xs mt-2 text-gray-400">
            Raw data items: {data.length}
          </div>
        </div>
      </div>
    );
  }

  // Calculate total for percentages
  const totalAmount = filteredData.reduce((sum, item) => sum + (item.amount || 0), 0);
  console.log('🍩 [DonutChart] Total amount:', totalAmount);

  // Prepare chart configuration
  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      height: 350,
    },
    colors: [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))", 
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))"
    ],
    labels: filteredData.map((item) => item.name || 'Unknown'),
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
      formatter: (legendName, opts) => {
        try {
          const seriesIndex = opts.seriesIndex;
          const value = filteredData[seriesIndex];
          if (value) {
            const percentage = Math.round((value.amount / totalAmount) * 100);
            return `${legendName}: ${percentage}%`;
          }
          return legendName;
        } catch (error) {
          console.warn('🍩 [DonutChart] Legend formatter error:', error);
          return legendName;
        }
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Total Sessions",
              fontSize: "14px",
              fontWeight: "400",
              color: "hsl(var(--muted-foreground))",
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: "bold",
              color: "hsl(var(--foreground))",
              formatter: (val) => {
                try {
                  return compactFormat(+val);
                } catch (error) {
                  console.warn('🍩 [DonutChart] Value formatter error:', error);
                  return val.toString();
                }
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value, { seriesIndex }) => {
          try {
            const percentage = Math.round((value / totalAmount) * 100);
            return `${compactFormat(value)} sessions (${percentage}%)`;
          } catch (error) {
            console.warn('🍩 [DonutChart] Tooltip formatter error:', error);
            return `${value} sessions`;
          }
        }
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.15,
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'darken',
          value: 0.15,
        }
      }
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 400,
            height: 350,
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            width: "100%",
            height: 300,
          },
          legend: {
            position: "bottom",
            itemMargin: {
              horizontal: 6,
              vertical: 3,
            },
          }
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 280,
            height: 280,
          },
          legend: {
            fontSize: "12px",
          }
        },
      },
    ],
  };

  // Prepare series data
  const series = filteredData.map((item) => item.amount || 0);
  console.log('🍩 [DonutChart] Series data:', series);

  try {
    return (
      <div className="w-full">
        <Chart
          options={chartOptions}
          series={series}
          type="donut"
          height={350}
        />
        
        {/* Debug info - remove in production */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          Debug: {filteredData.length} items, {totalAmount} total sessions
        </div>
      </div>
    );
  } catch (error) {
    console.error('🍩 [DonutChart] Render error:', error);
    
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <div className="text-center">
          <div className="text-4xl mb-2">❌</div>
          <div>Chart render error</div>
          <div className="text-xs mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }
}