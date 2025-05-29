"use client";

import { useState } from "react";
import { compactFormat } from "@/lib/format-number";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type TabData = {
  name: string;
  amount: number;
}[];

type PropsType = {
  deviceData: TabData;
  browserData: TabData;
  osData: TabData;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function TabbedDonutChart({ deviceData, browserData, osData }: PropsType) {
  const [activeTab, setActiveTab] = useState<'devices' | 'browsers' | 'os'>('devices');

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'devices': return deviceData;
      case 'browsers': return browserData;
      case 'os': return osData;
      default: return deviceData;
    }
  };

  // Get current label based on active tab
  const getCurrentLabel = () => {
    switch (activeTab) {
      case 'devices': return 'Device Sessions';
      case 'browsers': return 'Browser Sessions';
      case 'os': return 'OS Sessions';
      default: return 'Sessions';
    }
  };

  const currentData = getCurrentData();
  const filteredData = currentData.filter(item => item.amount > 0);

  // Tab configuration
  const tabs = [
    { 
      key: 'devices' as const, 
      label: 'Devices', 
      icon: '📱',
      count: deviceData.reduce((sum, d) => sum + d.amount, 0)
    },
    { 
      key: 'browsers' as const, 
      label: 'Browsers', 
      icon: '🌐',
      count: browserData.reduce((sum, d) => sum + d.amount, 0)
    },
    { 
      key: 'os' as const, 
      label: 'Operating Systems', 
      icon: '💻',
      count: osData.reduce((sum, d) => sum + d.amount, 0)
    },
  ];

  // If no data for any tab, show placeholder
  if (tabs.every(tab => tab.count === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div>No analytics data available</div>
        </div>
      </div>
    );
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors: [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))"
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
        const total = filteredData.reduce((sum, d) => sum + d.amount, 0);
        const percentage = Math.round((value.amount / total) * 100);
        return `${legendName}: ${percentage}%`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: getCurrentLabel(),
              fontSize: "14px",
              fontWeight: "400",
            },
            value: {
              show: true,
              fontSize: "24px",
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
            width: 350,
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
            width: 280,
          },
        },
      },
    ],
  };

  const series = filteredData.map((item) => item.amount);

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-1 mb-6 p-1 bg-[hsl(var(--muted))] rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))/50]'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key 
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--muted-foreground))/20] text-[hsl(var(--muted-foreground))]'
              }`}>
                {compactFormat(tab.count)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chart Content */}
      {filteredData.length > 0 ? (
        <div className="flex justify-center">
          <Chart
            options={chartOptions}
            series={series}
            type="donut"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <div className="text-3xl mb-2">
              {tabs.find(t => t.key === activeTab)?.icon}
            </div>
            <div>No {activeTab} data available</div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {filteredData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          {filteredData.slice(0, 3).map((item, index) => {
            const total = filteredData.reduce((sum, d) => sum + d.amount, 0);
            const percentage = Math.round((item.amount / total) * 100);
            return (
              <div key={item.name} className="p-3 bg-[hsl(var(--muted))/50] rounded-lg">
                <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {item.name}
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {compactFormat(item.amount)} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}